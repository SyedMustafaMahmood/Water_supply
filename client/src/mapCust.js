import {React,useState,useEffect} from 'react';
import { useJsApiLoader, GoogleMap, Marker, Polyline, InfoWindow, StandaloneSearchBox } from "@react-google-maps/api";
import {Flex,Box,HStack,Button,ButtonGroup,Modal,ModalOverlay,ModalContent,ModalHeader,ModalBody,ModalCloseButton} from "@chakra-ui/react";
// import {AdvancedMarker,Pin} from '@vis.gl/react-google-maps' 
import * as FaIcons from 'react-icons/fa';
import * as AiIcons from 'react-icons/ai';
import { Link } from 'react-router-dom';
import { IconContext } from 'react-icons';
import { useRef } from "react";
import GreenHouseMarker from './greenhousemarker.jpeg'
import RedHouseMarker from './redhousemarker.jpeg'
import junctionmarker from './junctionmarker.jpeg'
import waterreservoir from './waterreservoir.jpeg'
import bg from './components/bg.jpg'
import './App.css'
import './components/Navbar.css'



  
function App()
{
    const origin = { lat: 16.82365305593255, lng: 78.36275955215761 };
    const MapLibraries = ["places"]
    const {isLoaded} = useJsApiLoader({
        googleMapsApiKey:"AIzaSyB6IhzjbQp_KS4lsGdGWq3TvMgMdngijQU",
        libraries:MapLibraries,
    })
    const [ map, setMap] = useState('')
    const [zoomLevel, setZoomLevel] = useState(17)
    const [coordinates, setCoordinates] = useState([])
    const [ center, setCenter] = useState(origin)
    const [searchBox, setSearchBox] = useState(null);
    const [ selectedhouseMarker, setSelectedhouseMarker] = useState(null)
    const [ selectedjunctionMarker, setSelectedjunctionMarker] = useState(null)
    const [ selectedreservoir, setSelectedreservoir] = useState(null)
    const [ defaultcoordinates, setDefaultCoordinates ] = useState([])
    const [ housecoords, setHouseCoords ] = useState([])
    const [ defaultHouseCoords, setDefaultHouseCoords ] = useState([])
    const [ junctioncoords , setJunctionCoords] = useState([])
    const [ defaultjunctioncoords , setDefaultJunctionCoords ] = useState([])
    const [waterReservoirCoords, setWaterReservoirCoords] = useState([])
    const [selectedHouseForJunction, setSelectedHouseForJunction] = useState(null);
    let [ subcoords, setSubCoords ] = useState([])
    const [ isModalOpen, setIsModalOpen ] = useState(false)
    const [ isSubModalOpen, setIsSubModalOpen ] = useState(false)
    const [ modalContent, setModalContent ] = useState({})
    let [ markerFunction, setMarkerFunction ] = useState(0)
    const [waterQuantity, setWaterQuantity] = useState(1000)
    const [ description, setDescription ] = useState('')
    const [sidebar, setSidebar] = useState(false);
    const showSidebar = () => setSidebar(!sidebar);
    const navRef = useRef();
    const openModal = (header,body) => {
        if (header == "FAILED"){
            setModalContent({
              header: '❌'+header,
              body: body,
              border: "3px solid red"
            });
          }
          else{
            setModalContent({
              header: '✅'+header,
              body: body,
              border: "3px solid lightgreen"
            });
          }
        setIsSubModalOpen(true);
        // Automatically close the modal after 2 seconds
        setTimeout(() => {
            setIsSubModalOpen(false);
        }, 2000);
    };
    
    let SidebarData = [
        {
          title: 'Raise a Complaint',
          onclick:() =>{setIsModalOpen(true)},
          cName: 'nav-text',
        },
      ];

    const onPlacesChanged = () => {
        const places = searchBox.getPlaces();
        if (places.length > 0) {
          const selectedPlace = places[0].geometry.location;
          map.panTo({ lat: selectedPlace.lat(), lng: selectedPlace.lng() });
        }
      };

    function addMarker(pos){
        if(markerFunction == 1){
            setSubCoords((prevSubCoords) => [...prevSubCoords, pos])
            if(subcoords.length!=0){
                const delextracoords = [...coordinates]
                delextracoords.pop()
                setCoordinates(delextracoords)
            }
            setCoordinates((prevcoordinates) => [...prevcoordinates,[...subcoords,pos]])
        }
        else if (markerFunction == 2){
            const newhouse = {
                CANID : "H" + (housecoords.length+1),
                hcoords : pos,
                waterSupplied : true,
                assignedJunction : null,
            }
            setHouseCoords((prevHouseCoords) => [...prevHouseCoords, newhouse])
            //console.log(housecoords)
            //console.log(housecoords[selectedhouseMarker].assignedJunction)
        }
        else if(markerFunction == 3){
            const newjunction = {
                JID : "J" + (junctioncoords.length+1),
                jcoords : pos,
                houses : [],
                waterSupplied : true,
            }
            setJunctionCoords((prevjunctioncoords) => [...prevjunctioncoords,newjunction])
            //console.log(junctioncoords)
        }
    }

    function drawLine(){
        setMarkerFunction(1)
        if ( subcoords.length>0){
            // setCoordinates([...coordinates,subcoords])
            setSubCoords([])
            // console.log(coordinates)
        }
    }
    
    function houseMarker(){
        setMarkerFunction(2)
        // setHouseCoords((prevHouseCoords) => [...prevHouseCoords,pos])
    }

    //function for junction marker

    function junctionMarker(){
        setMarkerFunction(3)
    }
    
    function deleteLastHouse(){
        if (housecoords.length > 0 && housecoords.length>defaultHouseCoords.length){
            const newHouseCoords = [...housecoords]
            newHouseCoords.pop()
            setHouseCoords(newHouseCoords)
        }
    }

    //function for deleting last junction
    function deleteLastJunction(){
        if (junctioncoords.length>0 && junctioncoords.length>defaultjunctioncoords.length){
            const newjunctioncoords = [...junctioncoords]
            newjunctioncoords.pop()
            setJunctionCoords(newjunctioncoords)
        }
    }

    function deleteLastLine(){
        setSubCoords((prevSubCoords) => {
            const updatedSubcoords = [...prevSubCoords];
            updatedSubcoords.pop();
            return updatedSubcoords;
          });
        
          setCoordinates((prevCoordinates) => {
            const lastLineIndex = prevCoordinates.length - 1;
            // if (lastLineIndex < 0) {         //only useful if there are no elements in the coordinates array
            //   return [];
            // }
        
            const lastLine = prevCoordinates[lastLineIndex];
            const updatedCoordinates = [...prevCoordinates];
            updatedCoordinates[lastLineIndex] = lastLine.slice(0, -1); // Remove the last point
            return updatedCoordinates;
          });
    }

    function assignJunctionToHouse(selectedHouse) {
        setSelectedHouseForJunction(selectedHouse);
    }

    function assignJunctionToSelectedHouse(selectedJunction) {
        if (selectedHouseForJunction) {
            const updatedHouseCoords = housecoords.map((house) => {
                if (house === selectedHouseForJunction) {
                    return {
                        ...house,
                        assignedJunction: selectedJunction.JID,
                    };
                }
                return house;
            });
    
            setHouseCoords(updatedHouseCoords);
    
            const updatedJunctions = junctioncoords.map((junction) => {
                if (junction === selectedJunction) {
                    return {
                        ...junction,
                        houses: [...junction.houses, selectedHouseForJunction.CANID],
                    };
                }
                return junction;
            });
    
            setJunctionCoords(updatedJunctions);
    
            setSelectedHouseForJunction(null);
        }
    }

    function toggleHouseWaterSupply(index) {
        const updatedHouseCoords = housecoords.map((house, i) => {
            if (i === index) {
                return {
                    ...house,
                    waterSupplied: !house.waterSupplied,
                };
            }
            return house;
        });
        setHouseCoords(updatedHouseCoords);
    }

    function toggleJunctionWaterSupply(index) {
        const updatedJunctionCoords = junctioncoords.map((junction, i) => {
            if (i === index) {
                const updatedJunction = {
                    ...junction,
                    waterSupplied: !junction.waterSupplied,
                };
    
                // Update house water supply status under this junction
                const updatedHouseCoords = housecoords.map((house) => {
                    if (house.assignedJunction === junction.JID) {
                        return {
                            ...house,
                            waterSupplied: updatedJunction.waterSupplied,
                        };
                    }
                    return house;
                });
    
                setHouseCoords(updatedHouseCoords);
                return updatedJunction;
            }
            return junction;
        });
        setJunctionCoords(updatedJunctionCoords);
    }
    


    const markerIndex = (index , markertype) => {
        if (markertype == 'house')
        {
            setSelectedhouseMarker(index)
            setSelectedjunctionMarker(null)
        }else if (markertype == 'junction'){
            setSelectedjunctionMarker(index)
            setSelectedhouseMarker(null)
        }
    };

    const handleZoomChanged = () => {
        if (map) {
            setZoomLevel(map.getZoom());
        }
    };

    const getMarkerSize = () => {
        return Math.max(80 - zoomLevel * 3, 10);
    };
    
    useEffect(() => {
        const fetchCoordinates = async () => {
          try {
            const response = await fetch('http://localhost:5000/api/default',{
                method:'POST',
                headers:{
                    'Content-Type':'application/json'
                }
            });
            const data = await response.json();
            //console.log(data.housecoords)
            setCoordinates(data.coordinates)
            setDefaultCoordinates(data.coordinates)
            setCoordinates(data.coordinates)
            setDefaultHouseCoords(data.housecoords)
            setHouseCoords(data.housecoords)
            setDefaultJunctionCoords(data.junctions)
            setJunctionCoords(data.junctions)
            setWaterReservoirCoords(data.waterReservoirCoords)
        } catch (error) {
            console.error(error);
          }
        };
    
        fetchCoordinates();
      }, []); 


    async function submitComplaints(event){
        event.preventDefault()
        try{
        const response = await fetch('http://localhost:5000/api/mapCust/:ID',{
            method:'POST',
            headers:{
                'Content-Type':'application/json'
            },
            body: JSON.stringify({
                description,
            }),
        })
        const data = await response.json()
        console.log(data)
        if(data){
            openModal(data.status,data.message)
        }
        else{
        }
        } catch (error) {
            console.error("Error: ",error)
        }    
    }
    
    if (!isLoaded){
        return "Loading"
    }
    return(
        <div className='map' style={{backgroundImage : `url(${bg})`,  
        backgroundSize: 'cover',
        
        backgroundPosition: 'center',
        // backgroundRepeat: 'no-repeat',
        height: '150vh',
        width:'100vw',
        opacity: '90%'}}>
        <IconContext.Provider value={{ color: '#fff' }}>
        <div className='navbar'> 
          <header>
                <nav ref={navRef}>
                  <a href="/#">about us</a>
                  <a href="/#">contact</a>
                  <a href="/#">help</a>
                  <a href="/#">complaint</a>
                </nav>
              </header>
          <Link to='#' className='menu-bars'>
            <i className='fas fa-paintbrush' onClick={showSidebar} style={{color: 'blueviolet'}}/>
          </Link>
        </div>
        <nav className={sidebar ? 'nav-menu active' : 'nav-menu'}>
          <ul className='nav-menu-items' >
            <li className='navbar-toggle'>
              <Link to='#' className='menu-bars'>
                {/* <AiIcons.AiOutlineClose /> */}
                <i className='far fa-circle-xmark' onClick={showSidebar} style={{color: 'blueviolet'}}/>
              </Link>
            
            </li>
            /* {SidebarData.map((item, index) => {
              return (
                <li key={index} className={item.cName}>
                  <Link onClick={item.onclick}>
                    <span>{item.title}</span>
                  </Link>
                </li>
              );
            })} 
          </ul>
        </nav>
    </IconContext.Provider>
        {map && (
                <StandaloneSearchBox
                onLoad={(ref) => {setSearchBox(ref)}}
                onPlacesChanged={onPlacesChanged}
                >
                <input
                    type="text"
                    placeholder="   Search for a location"
                    style={{
                    boxSizing: `border-box`,
                    border: `1px solid transparent`,
                    width: `300px`,
                    height: `32px`,
                    marginTop:'20px',
                    marginLeft:'180px',
                    borderRadius: `3px`,
                    boxShadow: `0 2px 6px rgba(0, 0, 0, 0.3)`,
                    fontSize: `14px`,
                    outline: `none`,
                    textOverflow: `ellipses`,
                    position:'absolute',
                    }}
                />
                </StandaloneSearchBox>
            )}
        <Flex 
        position="relative"
        flexdirection="column"
        alignItems="center"
        h="100vh"
        w="100vw"
        zIndex="-10">
            {/* Google Map */}
            <GoogleMap 
            center={center} 
            zoom={zoomLevel}
            onZoomChanged={handleZoomChanged}
            mapContainerStyle={{width:"80%", height:"80%",left:"150px",top:"-10px"}}
            options={{
                streetViewControl:false,
                mapTypeControl:false,
                fullscreenControl:false,
                clickableIcons:false,
                styles:[
                    {
                        featureType:"poi",
                        elementType:"labels",
                        stylers:[{visibility:"off"}],
                    },
                    {
                        featureType: 'road',
                        elementType: 'geometry.stroke',
                        stylers: [{ color: '#1017FFF' },{weight:1}], // Set the color for roads (blue lines)#4285F4
                    },
                ]
            }}
            onLoad={(map) => setMap(map) }
            onClick={(event) => addMarker(event.latLng)}>
            
            {/* onRightClick={(event) => houseMarker(event.latLng)}> */}

            {/* Displaying markers */}
            {/* {showMarkers && map && <Marker position={origin} />} */}
            
            {housecoords.map((housecoord,index) => (
                <Marker key={index + 1} position={housecoord.hcoords} onClick={() => markerIndex(index,'house')} 
                icon={{
                    url:housecoord.waterSupplied ? GreenHouseMarker : RedHouseMarker,
                    scaledSize:new window.google.maps.Size(20,20)}} /> 
            ))
            }
                
            {/* Displaying junctions */}
            
            {junctioncoords.map((junctioncoord,index) => (
                <Marker key={index + 1} position={junctioncoord.jcoords} onClick={() => markerIndex(index,'junction')} 
                icon={{
                    url:junctionmarker,
                    scaledSize:new window.google.maps.Size(20,20)}} /> 
                ))}

            {/* {showMarkers && subcoords.map((coords,index) => (
                    <Marker key={index} position={coords} />
                )    
            )} */}

            {/* Draw default polyline */}    
            {defaultcoordinates.map((lineArray,lineIndex) => (
                <Polyline path={lineArray} key={lineIndex} options={{strokeColor:"deepskyblue",strokeOpacity:1,geodesic:true}} />
            ))}
            
            {/* Draw users polylines */}    
            {coordinates.map((lineArray,lineIndex) => (
                <Polyline path={lineArray} key={lineIndex} options={{strokeColor:"deepskyblue",strokeOpacity:1}} />
            ))}

            {waterReservoirCoords.map((waterReservoircoord,index) => (
                <Marker key={index + 1} position={waterReservoircoord} onClick={() => markerIndex(index,'reservoir')} 
                icon={{
                    url:waterreservoir,
                    scaledSize:new window.google.maps.Size(Math.max(20, 120 / Math.pow(2, 17 - zoomLevel)),Math.max(20, 120 / Math.pow(2, 17 - zoomLevel)))}} /> 
                ))}
            
            {/* Display InfoWindow when a house is selected */}
            {selectedhouseMarker !== null && (
                <InfoWindow
                position={housecoords[selectedhouseMarker].hcoords}
                onCloseClick={() => setSelectedhouseMarker(null)} // Close InfoWindow when clicked
                >
                {/* Add your content for the InfoWindow */}
                <div>
                    <h3>HOUSE INFORMATION</h3>
                    <p> house number : {housecoords[selectedhouseMarker].CANID}</p>
                    <p>
                        Water Supply status:{housecoords[selectedhouseMarker].waterSupplied?'YES':'NO'}
                    </p>
                    <p> Junction to house : {housecoords[selectedhouseMarker].assignedJunction}</p>

                </div>
                </InfoWindow>
            )}

            {/* Display InfoWindow when a junction is selected */}
            {selectedjunctionMarker !== null && (
                <InfoWindow
                position={junctioncoords[selectedjunctionMarker].jcoords}
                onCloseClick={() => setSelectedjunctionMarker(null)} // Close InfoWindow when clicked
                >
                {/* Add your content for the InfoWindow */}
                <div>
                    <h3>JUNCTION INFORMATION</h3>
                    <p> Junction number : {junctioncoords[selectedjunctionMarker].JID}</p>
                    <p> Houses under junction : {junctioncoords[selectedjunctionMarker].houses.join(', ')}</p>
                    <p> 
                        Water supply status:{junctioncoords[selectedjunctionMarker].waterSupplied?'YES':'NO'}
                    </p>
                </div>
                </InfoWindow>
            )}

            {selectedreservoir !== null && (
            <InfoWindow
                position={waterReservoirCoords[selectedreservoir]}
                onCloseClick={() => setSelectedreservoir(null)} // Close InfoWindow when clicked
            >
                {/* Add content for the InfoWindow */}
                <div>
                <h3>RESERVOIR INFORMATION</h3>
                <p>Water Quantity: {waterQuantity}</p>
                </div>
            </InfoWindow>
            )}


            </GoogleMap> 
        {/* Modal for submitting complaint */}
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} blockScrollOnMount={false}>
        <ModalOverlay />
            <ModalContent bg="white" border="2px solid red" borderRadius="5px" p={10} top={120} left="20%" boxSize="60%" style={{height:"75%"}}>
            <ModalCloseButton style={{marginLeft:'97%'}} />
                <ModalHeader style={{marginLeft:'32%',fontWeight:'bold',fontSize:30}}>RAISE A COMPLAINT</ModalHeader>
                <br/>
                <br/>
                <ModalBody>
                <h3>Description : 
                <input 
                    value={description}
                    onChange={(e)=>setDescription(e.target.value)}
                    placeholder='Enter Your Complaint'
                    type='text' 
                    style={{marginLeft:10,width:'70%',height:'50px'}}
                    />
                </h3>
                <br/>
                <br/>
                <br/>
                <br/>
                <input type='submit' style={{width:'10%',backgroundColor:'skyblue',marginLeft:'90%'}} onClick={submitComplaints} />
                </ModalBody>
            </ModalContent>
        </Modal>
        {/* Modal for displaying success message */}
        <Modal isOpen={isSubModalOpen} onClose={() => setIsSubModalOpen(false)} blockScrollOnMount={false}>
        <ModalOverlay />
        <ModalContent bg="white" border={modalContent.border} borderRadius="5px" p={10} top={70} left="40%" boxSize="18%">
        <ModalHeader style={{marginLeft:65}}>{modalContent.header}</ModalHeader>
            <ModalBody>
                {modalContent.body}
            </ModalBody>
        </ModalContent>
        </Modal>
        </Flex>
        </div>
    )
}



export default App




