import { useEffect } from 'react'

export default function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title
      ? `${title} | Fatima Tours and Travels`
      : 'Fatima Tours and Travels | Luxury Journeys'
  }, [title])
}
