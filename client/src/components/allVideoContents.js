import {React, useState} from 'react';
import "../App.css";
import Data from '../Data.json';
import AddVideo from './addVideo';
import Search from './search.js';
import VideoFrames from './videoFrames.js';



const AllVideoFiles = () => {
    const [deleteVideos, setDeleteVideos] = useState(Data);
    const [searchVideos, setSearchVideos] = useState([]);
    const handleDelete = (event) => {
        
        const videoTitle = event.currentTarget.parentNode.childNodes[0].textContent;
        const removedVideo = []
        const videoToDelete = deleteVideos.filter((obj) => {
            if(!(obj["title"] === videoTitle)){
            return obj;
            }
        })
        setDeleteVideos(videoToDelete);
    }

    const handleSearch = (event) => {
        const searchedVideo = event.target.value.toLowerCase();
        console.log(searchedVideo);
        const selectedVideo = [];
        const selectVideo = deleteVideos.filter((obj) => {
            if(obj["title"].toLowerCase().includes(searchedVideo)){
                selectedVideo.push(obj)
            }
        })
        console.log(selectedVideo)
        console.log(selectVideo)
        setDeleteVideos(selectedVideo);
    }
return (
    <div>
        <div className = "addVideoSearch">
            <AddVideo />
            <Search handleSearch = {handleSearch} />
        </div>
    <VideoFrames Data = {deleteVideos} handleDelete = {handleDelete}/>
    
    </div>
)
}


export default AllVideoFiles;