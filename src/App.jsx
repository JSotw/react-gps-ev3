import "./App.css";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import { get, ref } from "firebase/database";
import { db } from "./firebase/config.js";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { MapContainer, TileLayer, Popup, Marker, Circle } from "react-leaflet";
import { Icon } from "leaflet";
import gpsIcon from "./assets/icon/gps-icon.png";

function App() {
  const [locations, setLocations] = useState([]);
  const [users, setUsers] = useState([]);
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [position, setPosition] = useState();
  const [map, setMap] = useState(null);

  let centerOut = [-35.4364, -71.64442];

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
          //console.log(arrayData);
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
          //console.log(arrayData);
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
    // Intervalo para actualizar los datos cada 6segundos
    if (users != undefined && locations != undefined) {
      setInterval(() => {
        getUsersData();
        getLocationData();
      }, 6000);
    }
    setInterval(() => {
      setLoading(false);
    }, 3000);
  }, []);
  // console.log(users);
  // console.log(userId);

  let userData = users?.find((user) => user.id === userId);
  // let position = {
  //   lat: userLocationData?.latitude,
  //   lng: userLocationData?.longitude,
  // };

  //console.log(mapCenter);
  let pos = locations?.find((location) => location.id === userId);
  let actPos = {
    lat: pos?.latitude,
    lng: pos?.longitude,
  };

  const onChange = (e) => {
    // Dividir la cadena en dos partes usando split(',')
    const valuesArray = e.split(",");
    // Crear un objeto con las dos partes
    const valuesObject = {
      id: valuesArray[0],
      lat: valuesArray[1],
      lng: valuesArray[2],
    };
    let latLng = {
      lat: valuesObject.lat,
      lng: valuesObject.lng,
    };
    //console.log(coordenadasObjeto.id);
    setUserId(valuesObject.id);
    if (locations) {
      setPosition(latLng);
      map.setView(latLng, map.getZoom());
    }
    
  };

  // Definir los límites del rango de coordenadas
  const bounds = {
    north: -35.4264, // 0.01 grados al norte
    south: -35.4464, // 0.01 grados al sur
    east: -71.6076, // 0.01 grados al este
    west: -71.6276, // 0.01 grados al oeste
  };

  // Función para verificar si la posición está dentro de los límites
  const isWithinBounds = ({ lat, lng }) => {
    return (
      lat <= bounds.north &&
      lat >= bounds.south &&
      lng <= bounds.east &&
      lng >= bounds.west
    );
  };

  useEffect(() => {
    if (position) {
      if (!isWithinBounds(position)) {
        alert("Estás fuera del rango permitido");
        // Aquí puedes agregar lógica adicional si la posición está fuera del rango
      }
    }
  }, [position]);

  console.log(position);

  const customIcon = new Icon({
    iconUrl: gpsIcon,
    iconSize: [40, 42],
    shadowSize: [41, 41],
  });

  const zoom = 17;
  if (!loading) {
    if (userId === "") {
      //console.log("No user selected");
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
      return (
        <main>
          <h1 className="font-bold mb-6">Ubicación</h1>
          <div>
            {
              <section className="flex flex-row gap-3 rounded-lg">
                <div className="bg-white rounded-lg p-5 text-left text-gray-700 w-64">
                  <h4 className="font-bold text-[17px] mb-2">
                    Información adicional
                  </h4>
                  <ul className="text-left text-sm">
                    <li>
                      <b>Nombre:{" "}</b>
                      {`${userData?.nombre} ${
                        userData?.apellido ? userData?.apellido : ""
                      } ${
                        userData?.apellidoMaterno
                          ? userData?.apellidoMaterno
                          : ""
                      }`}
                    </li>
                    <li><b>Correo: </b> {userData?.email}</li>
                    <li><b>Teléfono: </b>{userData?.telefono}</li>
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
                          <p>{userData?.nombre}{" "}
                          {userData?.apellido ? userData?.apellido : ""}</p>
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
                        value={[
                          location.id,
                          location.latitude,
                          location.longitude,
                        ]}
                      >
                        {users?.map((user) =>
                          user.id === location.userId ? user.nombre : ""
                        )}
                      </option>
                    ))}
                  </select>
                </section>
              </section>
            }
          </div>
        </main>
      );
    }
  } else {
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
}

export default App;
