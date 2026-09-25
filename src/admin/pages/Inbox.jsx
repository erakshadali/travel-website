import { Mail, Phone, Search } from 'lucide-react'
import { useState } from 'react'
import useDocumentTitle from '../../hooks/useDocumentTitle'
import { adminApi } from '../api'
import { fmtDateTime, fmtDay, travellersText } from '../format'
import { useDebounced, useFetch } from '../hooks'
import { DetailList, Field, ListState, PageHeader, Pagination } from '../ui'

const contactLink = 'inline-flex min-h-11 items-center gap-2 text-sm text-gold-light underline-offset-4 hover:underline'

// Search box + paginated list, shared by the three read-only pages below.
function InboxPage({ title, noun, load, searchPlaceholder, emptyText, listClass = 'space-y-4', renderItem }) {
  useDocumentTitle(`Admin ${title.toLowerCase()}`)
  const [typed, setTyped] = useState('')
  const search = useDebounced(typed.trim(), 300)
  // The page number belongs to one search: a new search starts again at page 1 without an extra request.
  const [paged, setPaged] = useState({ search: '', page: 1 })
  const page = paged.search === search ? paged.page : 1

  const list = useFetch(() => load({ search, page, limit: 20 }), [search, page])

  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Admin" title={title}>
        {list.data && <p className="text-muted">{list.data.total} in total</p>}
      </PageHeader>

      <form role="search" onSubmit={(e) => e.preventDefault()} className="glass rounded-3xl p-5">
        <Field id="inbox-search" label="Search">
          <div className="relative">
            <Search size={16} className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-muted" aria-hidden />
            <input id="inbox-search" type="search" className="input-lux !pl-11" placeholder={searchPlaceholder} value={typed} onChange={(e) => setTyped(e.target.value)} autoComplete="off" />
          </div>
        </Field>
      </form>

      <section aria-label={title} aria-busy={list.loading}>
        <ListState loading={list.loading} error={list.error} onRetry={list.reload} empty={list.data && list.data.data.length === 0} emptyText={search ? 'Nothing matches that search.' : emptyText}>
          {list.data && (
            <>
              <ul className={`${listClass} transition-opacity ${list.loading ? 'opacity-60' : ''}`}>
                {list.data.data.map((item) => <li key={item.id} className="min-w-0">{renderItem(item)}</li>)}
              </ul>
              <Pagination data={list.data} onPage={(p) => setPaged({ search, page: p })} noun={noun} />
            </>
          )}
        </ListState>
      </section>
    </div>
  )
}

function Person({ item }) {
  return (
    <div className="flex flex-wrap items-center gap-x-5">
      <a href={`mailto:${item.email}`} className={contactLink}><Mail size={14} aria-hidden /> <span className="break-all">{item.email}</span></a>
      {item.phone && <a href={`tel:${item.phone.replace(/[^\d+]/g, '')}`} className={contactLink}><Phone size={14} aria-hidden /> {item.phone}</a>}
    </div>
  )
}

function TripPlanCard({ plan }) {
  return (
    <article className="glass rounded-3xl p-6 sm:p-8">
      <header className="flex flex-wrap items-start justify-between gap-x-6 gap-y-1">
        <h2 className="min-w-0 text-2xl break-words">{plan.name}</h2>
        <time dateTime={plan.createdAt} className="text-sm text-muted">{fmtDateTime(plan.createdAt)}</time>
      </header>
      <Person item={plan} />
      <div className="mt-4 border-t border-white/10 pt-5">
        <DetailList
          columns="sm:grid-cols-2 lg:grid-cols-3"
          items={[
            ['Destination', plan.destination],
            ['Dates', plan.flexibleDates ? 'Flexible' : `${fmtDay(plan.startDate)} to ${fmtDay(plan.endDate)}`],
            ['Travellers', travellersText(plan.travellers)],
            ['Budget per person', plan.budget],
            ['Hotel', plan.hotel],
            ['Interests', plan.interests.join(', ')],
          ]}
        />
      </div>
    </article>
  )
}

function MessageCard({ message }) {
  const [open, setOpen] = useState(false)
  const long = message.message.length > 220 || message.message.includes('\n')
  const subject = encodeURIComponent(`Re: ${message.topic ?? 'Your enquiry'}`)
  return (
    <article className="glass rounded-3xl p-6 sm:p-8">
      <header className="flex flex-wrap items-start justify-between gap-x-6 gap-y-1">
        <div className="flex min-w-0 flex-wrap items-center gap-3">
          <h2 className="min-w-0 text-2xl break-words">{message.name}</h2>
          {message.topic && <span className="rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-[12px] leading-none text-gold-light">{message.topic}</span>}
        </div>
        <time dateTime={message.createdAt} className="text-sm text-muted">{fmtDateTime(message.createdAt)}</time>
      </header>
      <Person item={message} />
      <p className={`mt-3 text-[15px] break-words whitespace-pre-wrap text-ivory/90 ${long && !open ? 'line-clamp-3' : ''}`}>{message.message}</p>
      <div className="mt-2 flex flex-wrap items-center gap-x-6">
        {long && (
          <button type="button" className="inline-flex min-h-11 items-center text-sm text-muted hover:text-gold-light" onClick={() => setOpen(!open)} aria-expanded={open}>
            {open ? 'Show less' : 'Read more'}
          </button>
        )}
        <a href={`mailto:${message.email}?subject=${subject}`} className={contactLink}><Mail size={14} aria-hidden /> Reply by email</a>
      </div>
    </article>
  )
}

export const TripPlansPage = () => (
  <InboxPage title="Trip plans" noun="plans" load={adminApi.tripPlans} searchPlaceholder="Name, email, destination..." emptyText="No trip plans yet. Plans sent from the Trip Planner appear here." renderItem={(plan) => <TripPlanCard plan={plan} />} />
)

export const MessagesPage = () => (
  <InboxPage title="Messages" noun="messages" load={adminApi.messages} searchPlaceholder="Name, email, topic, text..." emptyText="No messages yet. Messages from the contact form appear here." renderItem={(message) => <MessageCard message={message} />} />
)

export const SubscribersPage = () => (
  <InboxPage
    title="Subscribers"
    noun="subscribers"
    load={adminApi.subscribers}
    searchPlaceholder="Email address..."
    emptyText="No subscribers yet. Sign-ups from the newsletter form appear here."
    listClass="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
    renderItem={(sub) => (
      <div className="glass min-w-0 rounded-2xl p-5">
        <p className="text-sm break-all">{sub.email}</p>
        <p className="mt-1 text-sm text-muted">Subscribed {fmtDay(sub.createdAt)}</p>
      </div>
    )}
  />
)
