import { useEffect } from 'react'

export default function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title
      ? `${title} | Premium Tours and Travels`
      : 'Premium Tours and Travels | Luxury Journeys'
  }, [title])
}
