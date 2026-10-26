import { useEffect } from 'react'
import { site } from '../data/data'

export default function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title
      ? `${title} | ${site.name}`
      : `${site.name} | Luxury Journeys`
  }, [title])
}
