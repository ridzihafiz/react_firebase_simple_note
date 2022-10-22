import React, { useEffect, useState } from "react";
import { firestore } from "../config/firebaseConfig";
import {
  doc,
  setDoc,
  collection,
  getDocs,
  onSnapshot,
  deleteDoc,
} from "firebase/firestore";
import moment from "moment";

export default function Home() {
  // state
  const [data, setData] = useState([]);
  const [updateData, setUpdateData] = useState();

  // handle submit
  const handleSubmit = (e) => {
    e.preventDefault();

    // tangkap value
    let note = e.target.note.value;
    let author = e.target.author.value;

    e.target.note.value = "";
    e.target.author.value = "";

    // console.log({ note, author });

    // store to firebase
    const docId = Date.now().toString();
    const noteRef = doc(firestore, "note_app", docId);
    setDoc(noteRef, {
      id: docId,
      note,
      author,
      createdAt: Date.now(),
    })
      .then((res) => {
        console.log("data succesfull stored");
      })
      .catch((err) => {
        console.error(err);
      });
  };

  // function untuk ambil data dari collection
  const getNotesCollection = async () => {
    let collArr = [];
    let noteRef = collection(firestore, "note_app");
    let collectData = await getDocs(noteRef).then((res) => {
      res.forEach((e) => {
        collArr.push(e.data());
      });
    });
    return collArr;
  };

  // delete note
  const handleDelete = (id) => {
    let docId = doc(firestore, "note_app", id);
    deleteDoc(docId)
      .then((res) => {
        console.log("data berhasil di delete");
      })
      .catch((err) => {
        console.error(err);
      });
  };

  // update data
  const handleUpdate = (event) => {
    event.preventDefault();
    let note = event.target.note.value;

    const noteRef = doc(firestore, "note_app", updateData.id);
    setDoc(noteRef, {
      ...updateData,
      note: note,
    })
      .then((res) => {
        console.log("data updated");
      })
      .catch((err) => {
        console.error(err);
      });
    setUpdateData(null);
  };

  // listener function
  const listener = () => {
    let noteRef = collection(firestore, "note_app");
    onSnapshot(noteRef, (newRec) => {
      getNotesCollection()
        .then((collArr) => {
          setData(collArr);
        })
        .catch((err) => {
          console.error(err);
        });
    });
  };

  // comp lifesycle
  useEffect(() => {
    getNotesCollection()
      .then((collArr) => {
        setData(collArr);
      })
      .catch((err) => {
        console.error(err);
      });

    // comp did update
    return () => {
      listener();
    };
  }, []);

  return (
    <div className="App">
      <h1>Home Page</h1>

      <form autoComplete="off" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="note">note</label>
          <textarea id="note"></textarea>
        </div>

        <div>
          <label htmlFor="author">author</label>
          <input type="text" id="author" />
        </div>

        <button type="submit">submit</button>
      </form>

      <div
        style={{
          marginTop: 40,
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        {/* Jika pakai () tanpa harus ada return */}
        {/* Jika pakai {} harus menggunakan return */}
        {data.map((e) => (
          <div
            key={e.id}
            style={{
              position: "relative",
              padding: 20,
              border: "1px solid white",
              // borderRadius: 20,
            }}
          >
            {updateData?.id == e.id ? (
              <form
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
                onSubmit={handleUpdate}
              >
                <label htmlFor="note">note</label>
                <input type="text" id="note" defaultValue={e.note} />
                <button type="submit">submit</button>
              </form>
            ) : (
              <p> {e.note} </p>
            )}
            <small> {e.author} | </small>
            <small> {moment(e.createdAt).format("DD/MMM/YYYY hh:mm")} </small>
            <button
              style={{
                backgroundColor: "red",
                position: "absolute",
                top: 4,
                right: 4,
                fontSize: 10,
              }}
              onClick={() => {
                handleDelete(e.id);
              }}
            >
              x
            </button>

            <button
              style={{
                backgroundColor: "green",
                position: "absolute",
                top: 4,
                right: 40,
                fontSize: 10,
              }}
              onClick={() => {
                if (!updateData) {
                  return setUpdateData(e);
                }
                setUpdateData(null);
              }}
            >
              ?
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
