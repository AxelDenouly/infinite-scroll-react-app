import { useState, useEffect, useRef } from "react"
import spinner from "../assets/spinner.svg"
import usePhotos from "../hooks/usePhotos"

export default function List() {

    const [query, setQuery] = useState("random")
    const [pageNumber, setPageNumber] = useState(1) // Seite Number
    const lastPicRef = useRef()
    const searchRef = useRef()  // Die Suche

    const photoApiData = usePhotos(query, pageNumber)

    useEffect(() => {
        if(lastPicRef.current) {
            const observer = new IntersectionObserver(([entry]) => {
                if(entry.isIntersecting && photoApiData.maxPages !== pageNumber) {
                    setPageNumber(pageNumber + 1)
                    lastPicRef.current = null
                    observer.disconnect()
                }
            })

            observer.observe(lastPicRef.current)
        }
    }, [photoApiData])      // the useEffect for the infinite scroll

    // function for the research
    function handleSubmit(e) {
        e.preventDefault()
        if(searchRef.current.value !== query) {
            setQuery(searchRef.current.value)
            setPageNumber(1)
        }
    }

  return (
    <>
        <h1 className="text-4xl mb-5 text-center">Infinite Scroll..<br></br><span className=" text-xs text-slate-300">&copy; 2024 by Axel Denouly | All Right Reserved </span></h1>
        <form onSubmit={handleSubmit}>
            <label className="black mb-4" htmlFor="search">Research</label>
            <input
                ref={searchRef}
                placeholder="Search for a particular image..."
                className="block w-full mb-14 text-slate-800 py-3 px-2 text-md outline-gray-500 rounded border border-slate-400"
                type="text"
            />
        </form>

        {/* Error Display */}
        {photoApiData.error.state && <p>{ photoApiData.error.msg}</p>}

        {/* Kein Fehler aber auch keine Ergebnisse */}
        {(photoApiData.photos.length === 0 && !photoApiData.error.state && !photoApiData.loading) && <p>No images available for this query 😕</p>}

        <ul
        className="grid grid-cols-[repeat(auto-fill,minmax(250px,_1fr))] auto-rows-[175px] gap-4 justify-center"
        >
            {!photoApiData.loader && photoApiData.photos.length !== 0 && photoApiData.photos.map((photo, index) => {
                
                // for the infinite scroll when we reach the last pic
                if(photoApiData.photos.length === index + 1) {
                    return (
                    <li
                    ref={lastPicRef}
                    key={photo.id}>
                        <img
                            className="w-full h-full object-cover hover:-translate-y-1 hover:-translate-x-1"
                            src={photo.urls.regular}
                            alt={photo.alt_description}
                        />
                    </li>
                    )
                }
                else {
                return (
                    <li key={photo.id}>
                        <img
                            className="w-full h-full object-cover hover:-translate-y-1 hover:-translate-x-1"
                            src={photo.urls.regular}
                            alt={photo.alt_description}
                        />
                    </li>
                )
                }   
            })}
        </ul>

        {/* Loader */}
        {(photoApiData.loading && !photoApiData.error.state) &&
        <img className="block mx-auto" src={spinner} />}

        {/* When we reach the last page */}
        {photoApiData.maxPages === pageNumber && <p className="mt-10 text-lg text-center">No more images to show for this query...</p>}
    </>
  )
}