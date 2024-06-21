import "./App.css";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import { get, ref } from "firebase/database";
import { db } from "./firebase/config.js";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { MapContainer, TileLayer, Popup, Marker, Circle } from "react-leaflet";
import { Icon } from "leaflet";
import gpsIcon from "./assets/icon/gps-icon.png";
import axios from "./axios/config.js";

function App() {
  const [locations, setLocations] = useState([]);
  const [users, setUsers] = useState([]);
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [map, setMap] = useState(null);
  const [position, setPosition] = useState({ lat: null, lng: null });
  const [userLocation, setUserLocation] = useState(null);
  const [messageSent, setMessageSent] = useState(false); // Estado para saber si el mensaje ha sido enviado

  console.log(position);

  const getLocationData = async () => {
    const locationReef = ref(db, "location");
    get(locationReef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const arrayData = Object.entries(snapshot.val()).map(
            ([id, data]) => ({
              id,
              ...data,
            })
          );
          setLocations(arrayData);
        } else {
          console.log("No data");
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const getUsersData = async () => {
    const usersReef = ref(db, "users");
    get(usersReef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const arrayData = Object.entries(snapshot.val()).map(
            ([id, data]) => ({
              id,
              ...data,
            })
          );
          setUsers(arrayData);
        } else {
          console.log("No data");
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    getUsersData();
    getLocationData();
    setTimeout(() => {
      setLoading(false);
    }, 3000);
  }, []);

  useEffect(() => {
    const updateLocation = () => {
      const location = locations.find((location) => location.id === userId);
      setUserLocation(location);
      if (location) {
        setPosition({ lat: location.latitude, lng: location.longitude });
        if (map) {
          map.setView(
            { lat: location.latitude, lng: location.longitude },
            map.getZoom()
          );
        }
      } else {
        setPosition({ lat: null, lng: null });
      }
    };

    updateLocation(); // Llama a la función una vez inmediatamente

    const intervalId = setInterval(() => {
      getLocationData();
      updateLocation();
    }, 6000);

    return () => clearInterval(intervalId); // Limpia el intervalo cuando el componente se desmonte
  }, [locations, userId, map]);

  const onChange = (e) => {
    let valuesArray = e.split(",");
    setUserId(valuesArray[0]);
    let latLng = {
      lat: parseFloat(valuesArray[1]),
      lng: parseFloat(valuesArray[2]),
    };
    setPosition(latLng);
    setMessageSent(false); // Restablece el estado del mensaje cuando se selecciona un nuevo usuario
  };
  const centerOut = {
    lat: -35.4364,
    lng: -71.64442,
  };
  const bounds = {
    north: centerOut.lat + 0.05, // Aumenta 0.1 grados hacia el norte
    south: centerOut.lat - 0.05, // Disminuye 0.1 grados hacia el sur
    east: centerOut.lng + 0.05, // Aumenta 0.1 grados hacia el este
    west: centerOut.lng - 0.05, // Disminuye 0.1 grados hacia el oeste
  };

  const isWithinBounds = ({ lat, lng }) => {
    return (
      lat <= bounds.north &&
      lat >= bounds.south &&
      lng <= bounds.east &&
      lng >= bounds.west
    );
  };

  useEffect(() => {
    if (userId !== "") {
      const outOfBounds = !isWithinBounds(position);
      console.log(outOfBounds);
      if (outOfBounds && !messageSent) {
        console.log("Este usuario está fuera del rango permitido");
        axios.get("/send-message");
        setMessageSent(true); // Marca el mensaje como enviado
      } else if (!outOfBounds) {
        setMessageSent(false); // Restablece el estado si vuelve dentro del rango
      }
    }
  }, [position, userId, messageSent]);

  const customIcon = new Icon({
    iconUrl: gpsIcon,
    iconSize: [40, 42],
    shadowSize: [41, 41],
  });

  const zoom = 17;
  if (loading) {
    return (
      <section>
        <div className="">
          <h1 className="font-bold flex flex-col items-center gap-10">
            Cargando datos...
            <AiOutlineLoading3Quarters className="animate-spin" />
          </h1>
        </div>
      </section>
    );
  }

  if (userId === "") {
    return (
      <section>
        <div className="">
          <h1 className="font-bold mb-6">Bienvenido</h1>
        </div>
        <select
          className="w-full h-10 px-3 text-center font-semibold rounded-lg"
          name=""
          id=""
          onChange={(e) => onChange(e.target.value)}
        >
          <option selected={true} value="">
            Seleccione un usuario...
          </option>
          {locations?.map((location) => (
            <option
              key={location.id}
              value={[location.id, location.latitude, location.longitude]}
            >
              {users?.map((user) =>
                user.id === location.userId ? user.nombre : ""
              )}
            </option>
          ))}
        </select>
      </section>
    );
  } else {
    const fillBlueOptions = { fillColor: "blue" };
    const purpleOptions = { color: "red" };
    const userData = users.find((user) => user.id === userId);

    return (
      <main>
        <h1 className="font-bold mb-6">Ubicación</h1>
        <div>
          <section className="flex flex-row gap-3 rounded-lg">
            <div className="bg-white rounded-lg p-5 text-left text-gray-700 w-64">
              <h4 className="font-bold text-[17px] mb-2">
                Información adicional
              </h4>
              <ul className="text-left text-sm">
                <li>
                  <b>Nombre: </b>
                  {`${userData?.nombre} ${
                    userData?.apellido ? userData?.apellido : ""
                  } ${
                    userData?.apellidoMaterno ? userData?.apellidoMaterno : ""
                  }`}
                </li>
                <li>
                  <b>Correo: </b> {userData?.email}
                </li>
                <li>
                  <b>Teléfono: </b>
                  {userData?.telefono}
                </li>
              </ul>
            </div>
            <section className="flex flex-col gap-3">
              <div className="rounded-lg">
                <MapContainer
                  ref={setMap}
                  center={position}
                  zoom={zoom}
                  scrollWheelZoom={true}
                  className="rounded-lg h-96"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Circle
                    center={centerOut}
                    pathOptions={fillBlueOptions}
                    radius={5000}
                  />
                  <Circle
                    center={position}
                    pathOptions={purpleOptions}
                    radius={150}
                  />
                  <Marker icon={customIcon} position={position} isActive>
                    <Popup isActive>
                      <p>
                        {userData?.nombre}{" "}
                        {userData?.apellido ? userData?.apellido : ""}
                      </p>
                      <p>Latitud: {position.lat}</p>
                      <p>Longitud: {position.lng}</p>
                    </Popup>
                  </Marker>
                </MapContainer>
              </div>
              <select
                className="w-full h-10 px-3 text-center font-semibold rounded-lg"
                name=""
                id=""
                onChange={(e) => onChange(e.target.value)}
              >
                <option selected={true} value="">
                  Seleccione un usuario...
                </option>
                {locations?.map((location) => (
                  <option
                    key={location.id}
                    value={[location.id, location.latitude, location.longitude]}
                  >
                    {users?.map((user) =>
                      user.id === location.userId ? user.nombre : ""
                    )}
                  </option>
                ))}
              </select>
            </section>
          </section>
        </div>
      </main>
    );
  }
}

export default App;
