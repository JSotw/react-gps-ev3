import "./App.css";
import { useEffect, useState } from "react";
import { get, ref } from "firebase/database";
import { db } from "./firebase/config.js";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

function App() {
  const [locations, setLocations] = useState([]);
  const [users, setUsers] = useState([]);
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(true);

  let userLocationData = "";
  let userData = "";

  useEffect(() => {
    setInterval(() => {
      getUsersData();
      getLocationData();
      setLoading(false);
    }, 1000);
  }, []);
  // console.log(users);
  // console.log(userId);

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
            onChange={(e) => setUserId(e.target.value)}
          >
            <option selected={true} disabled={true} value="">
              Seleccione un usuario...
            </option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.nombre}
              </option>
            ))}
          </select>
        </section>
      );
    } else {
      //console.log("User selected");
      userData = users.find((user) => user.id === userId);
      userLocationData = locations.find(
        (location) => location.userId === userId
      );
      //console.log(userLocationData);

      return (
        <main>
          <h1 className="font-bold mb-6">Ubicación</h1>
          <div>
            {
              <section
                className="flex flex-row gap-3 rounded-lg"
              >
                <div
                  className="bg-white rounded-lg p-6 text-left text-gray-700 w-56"
                >
                  <h4 className="font-semibold">Información adicional</h4>
                  <ul className="text-left">
                    <li>{`${userData?.nombre} ${
                      userData?.apellido ? userData?.apellido : ""
                    } ${
                      userData?.apellidoMaterno ? userData?.apellidoMaterno : ""
                    }`}</li>
                    <li>{userData?.email}</li>
                    <li>{userData?.telefono}</li> 
                  </ul>
                </div>
                <section className="flex flex-col gap-3">
                  <div
                    className="rounded-lg"
                  >
                    <iframe
                      src={`https://maps.google.com/maps?q=${userLocationData?.latitude},${userLocationData?.longitude}&z=${zoom}&output=embed`}
                      width="600"
                      height="450"
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      className="rounded-lg"
                    ></iframe>
                  </div>
                  <select
                    className="w-full h-10 px-3 text-center font-semibold rounded-lg"
                    name=""
                    id=""
                    onChange={(e) => setUserId(e.target.value)}
                  >
                    <option selected={true} disabled={true} value="">
                      Seleccione un usuario...
                    </option>
                    {users.map((user) => (
                      <option
                        style={{ height: "50px" }}
                        key={user.id}
                        value={user.id}
                      >
                        {user.nombre}
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
