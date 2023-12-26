import {React,useState,useEffect} from 'react';
import { useJsApiLoader, GoogleMap, Marker, Polyline, InfoWindow } from "@react-google-maps/api";
import {Flex,Box,HStack,Button,ButtonGroup,Modal,ModalOverlay,ModalContent,ModalHeader,ModalBody,ModalCloseButton} from "@chakra-ui/react";
// import {AdvancedMarker,Pin} from '@vis.gl/react-google-maps' 
import GreenHouseMarker from './greenhousemarker.jpeg'
import RedHouseMarker from './redhousemarker.jpeg'
import './App.css'


function App()
{
    const origin = { lat: 16.82365305593255, lng: 78.36275955215761 };
    const {isLoaded} = useJsApiLoader({
        googleMapsApiKey:"AIzaSyB6IhzjbQp_KS4lsGdGWq3TvMgMdngijQU",
    })
    const [ map, setMap] = useState('')
    const [coordinates, setCoordinates] = useState([])
    const [showMarkers, setShowMarkers] = useState(true)
    const [ center, setCenter] = useState(origin)
    const [ selectedMarker, setSelectedMarker] = useState(null)
    const [ defaultcoordinates, setDefaultCoordinates ] = useState([])
    const [ housecoords, setHouseCoords ] = useState([])
    const [ defaultHouseCoords, setDefaultHouseCoords ] = useState([])
    let [ subcoords, setSubCoords ] = useState([])
    const [ isModalOpen, setIsModalOpen ] = useState(false)
    const [ modalContent, SetModalContent ] = useState({})
    let [ markerFunction, setMarkerFunction ] = useState(1)

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
            setHouseCoords((prevHouseCoords) => [...prevHouseCoords,pos])
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

    //used for showing or hiding markers
    function toggleMarkerVisibility() {     
        setShowMarkers((prevVisibility) => !prevVisibility);
    }

    function deleteLastHouse(){
        if (housecoords.length > defaultHouseCoords.length){
            const newHouseCoords = [...housecoords]
            newHouseCoords.pop()
            setHouseCoords(newHouseCoords)
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

    const markerIndex = (index) => {
        setSelectedMarker(index)
    }

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
            // console.log(data)
            // setCoordinates(data.coordinates)
            setDefaultCoordinates(data.coordinates)
            setCoordinates(data.coordinates)
            setHouseCoords(data.housecoords)
            setDefaultHouseCoords(data.housecoords)
            // console.log(defaultcoordinates)
            // console.log(coordinates)
          } catch (error) {
            console.error(error);
          }
        };
    
        fetchCoordinates();
      }, []); // Empty dependency array ensures the effect runs only once


      
        const openModal = (body) => {
            SetModalContent({
                body:body
            })
            
            setIsModalOpen(true);
            // Automatically close the modal after 2 seconds
            setTimeout(() => {
              setIsModalOpen(false);
            }, 2000);
          };


    async function submitCoordinates(event){
        event.preventDefault()
        try{
        const response = await fetch('http://localhost:5000/api/map',{
            method:'POST',
            headers:{
                'Content-Type':'application/json'
            },
            body: JSON.stringify({
                coordinates,
                housecoords,
            }),
        })
        const data = await response.json()
        if(data){
            openModal('✅Submitted succesfully')
        }
        // console.log(data); 
        } catch (error) {
            openModal('❌Error submitting coordinates');
            console.error("Error: ",error)
        }    
    }

    if (!isLoaded){
        return "Loading"
    }
    return(
        <div className='map'>
        <Navbar>
            <NavItem icon="Draw New Line" onClick={drawLine} />
            <NavItem icon="House Markers" onClick={houseMarker} />
            <NavItem icon="Delete Last Line" onClick={deleteLastLine} />
            <NavItem icon="Delete Last House" onClick={deleteLastHouse} />
            <NavItem icon="Submit" onClick={submitCoordinates} />
        </Navbar>
        <Flex 
        position="relative"
        flexdirection="column"
        alignItems="center"
        h="100vh"
        w="100vw"
        backgroundColor="white">
            {/* Google Map */}
            <GoogleMap 
            center={center} 
            zoom={17}
            mapContainerStyle={{width:"80%", height:"80%",left:"150px",top:"0"}}
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
                ]
            }}
            onLoad={(map) => setMap(map) }
            onClick={(event) => addMarker(event.latLng)}>
            {/* onRightClick={(event) => houseMarker(event.latLng)}> */}


            {/* Displaying markers */}
            {/* {showMarkers && map && <Marker position={origin} />} */}
            
            {housecoords.map((housecoord,index) => (
                <Marker key={index} position={housecoord} onClick={() => markerIndex(index)} 
                icon={{
                    url:GreenHouseMarker,
                    scaledSize:new window.google.maps.Size(20,20)}} /> 
                ))}

            {/* {showMarkers && subcoords.map((coords,index) => (
                    <Marker key={index} position={coords} />
                )    
            )} */}

            {/* Draw default polyline */}    
            {showMarkers && defaultcoordinates.map((lineArray,lineIndex) => (
                <Polyline path={lineArray} key={lineIndex} options={{strokeColor:"deepskyblue",strokeOpacity:1,geodesic:true}} />
            ))}

            {/* Draw users polylines */}    
            {showMarkers && coordinates.map((lineArray,lineIndex) => (
                <Polyline path={lineArray} key={lineIndex} options={{strokeColor:"deepskyblue",strokeOpacity:1,geodesic:true}} />
            ))}
            
            {/* Display InfoWindow when a marker is selected */}
            {selectedMarker !== null && (
                <InfoWindow
                position={housecoords[selectedMarker]}
                onCloseClick={() => setSelectedMarker(null)} // Close InfoWindow when clicked
                >
                {/* Add content for the InfoWindow */}
                <div>
                    <h3>Marker Information</h3>
                    <p>You have selected marker number {selectedMarker}</p>
                </div>
                </InfoWindow>
            )}

            </GoogleMap> 
             {/* Modal for success message */}
             <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} blockScrollOnMount={false}>
                <ModalOverlay />
                    <ModalContent bg="white" border="2px solid lightgreen" borderRadius="5px" p={10} top={70} left="40%" boxSize="15%">
                        {/* <ModalHeader>Success!</ModalHeader> */}
                        {/* <ModalCloseButton width={10} left="50%" /> */}
                        <ModalBody>
                            {modalContent.body}
                        </ModalBody>
                    </ModalContent>
            </Modal>
        {/* <Box
        position='absolute'
        p={4}
        borderRadius='lg'
        mt={4}
        bgColor='skyblue'
        shadow='base'
        minW='container.md'
        zIndex='modal'
        w='50%'
        h='7%'
        top="5%"            
        left="65%"           
        transform="translate(-50%, -50%)"
        >
        <HStack spacing={4}>
        <ButtonGroup height="100%">
            <Button bgColor="white" position="absolute" type="button" height="50%" 
            width="20%" onClick={drawLine}>
            Draw new line
            </Button>
            <Button bgColor="white" position="absolute" type="button" height="50%"
             width="20%" left="20%" onClick={houseMarker}>
            House Marker
            </Button>
            <Button bgColor="white" position="absolute" type="submit" 
            left="40.5%" height="50%" width="20%" onClick={deleteLastLine}>
            Delete last line
            </Button>
            <Button bgColor="white" position="absolute" type="submit" 
            left="61%" height="50%" width="19%" onClick={deleteLastHouse}>
            Delete last house
            </Button>
            <Button bgColor="white" position="absolute" type="submit" 
            left="80.5%" height="50%" width="18%" onClick={submitCoordinates}>
            Submit
            </Button>
        </ButtonGroup>
        </HStack>
        </Box> */}
        </Flex>
        </div>
    )
}

function Navbar(props) {
    return (
      <nav className="navbar">
        <ul className="navbar-nav">{props.children}</ul>
      </nav>
    );
  }
  
  function NavItem({ icon, onClick }) {
    return (
        <li className="nav-item">
            <a href="#" className="icon-button" onClick={onClick}>
                {icon}
            </a>
        </li>
    );
}

export default App