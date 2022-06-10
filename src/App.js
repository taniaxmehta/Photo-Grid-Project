import React, { useState, useEffect, useRef } from 'react'
import { FaSearch } from 'react-icons/fa'
import Photo from './Photo'
const clientID = `?client_id=${process.env.REACT_APP_ACCESS_KEY}`
const mainUrl = `https://api.unsplash.com/photos/`
const searchUrl = `https://api.unsplash.com/search/photos/`

{/* main app functionality */ }
function App() {
  {/* state values */ }
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState([])
  const [page, setPage] = useState(1)
  const [query, setQuery] = useState('')
  const mounted = useRef(false)
  const [newImages, setNewImages] = useState(false)

  {/* fetch the images from unsplash api */ }
  const fetchImages = async () => {
    setLoading(true)
    let url
    const urlPage = `&page=${page}`
    const urlQuery = `&query=${query}`

    {/* fetch photos by the user input query 
  if no query, then proceed with fetching assorted photos*/ }
    if (query) {
      url = `${searchUrl}${clientID}${urlPage}${urlQuery}`
    }
    else {
      url = `${mainUrl}${clientID}${urlPage}`
    }


    try {
      const response = await fetch(url)
      const data = await response.json()
      {/* fetch photos without sending too many requests */ }
      setPhotos((oldPhotos) => {
        if (query && page === 1) {
          return data.results
        }
        else if (query) {
          return [...oldPhotos, ...data.results]
        }
        else {
          return [...oldPhotos, ...data]
        }
      }) // pass data to start pulling photos
      setNewImages(false)
      setLoading(false) // stop loading since fetching is done

    } catch (error) {
      setNewImages(false)

      setLoading(false)

    }
  }

  {/* fetch images whenever app loads */ }
  useEffect(() => {
    fetchImages()
  }, [page])

  {/* listen for scroll event to create infinite scroll */ }

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true
      return
    }
    if (!newImages) return
    if (loading) return
    setPage((oldPage) => oldPage + 1)
  }, [newImages])


  {/* load new images when user reaches the bottom of the screen */ }
  const event = () => {
    if ((window.innerHeight + window.scrollY) >= document.body.scrollHeight - 2)
      setNewImages(true)
  }

  {/* allow images to be fetched when user scrolls */ }
  useEffect(() => {
    window.addEventListener('scroll', event)
    return () => window.removeEventListener('scroll', event)
  }, [])


  {/* handle the loading of photos when there is a query
handleSubmit will fetch images when page is 1 (top of screen) and there is a query */ }
  const handleSubmit = (e) => {
    e.preventDefault()
    if (!query)
      return
    if (page === 1) {
      fetchImages()
      return
    }
    setPage(1)
  }
  {/* form and images for return and display */ }
  return (<main>
    <section className='search'>
      <form className='search-form'></form>
      <input type='text' placeholder='search' className='form-input' value={query} onChange={(e) => setQuery(e.target.value)} />
      <button type="submit" className="submit-btn" onClick={handleSubmit}>
        <FaSearch />
      </button>
    </section>
    <section className="photos">
      <div className="photos-center">
        {photos.map((image, index) => {
          return <Photo key={image.id} {...image} />
        })}
      </div>
      {loading && <h2 className="loading">Loading...</h2>}
    </section>
  </main>)
}

export default App
