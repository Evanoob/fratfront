import axios from "axios";
import auth from "@/auth";
import {apiHandler} from "./../api/handler";
const handler = apiHandler();

export default {
    namespaced: true,
    state: {
        users: [],
        currentUser: null
    },

    getters: {
        all(state) {
            return state.users;
        },
        current(state) {
            return state.currentUser;
        }
    },

 // https://vuex.vuejs.org/fr/api/#mutations
    mutations: {
        setCurrent(state, infos) {
            state.currentUser = {
                ...infos
            };
        },
        setUsers(state, users) {
            state.users = users;
        },
        unsetCurrent(state) {
            state.currentUser = null;
        }
    },

      //https://vuex.vuejs.org/fr/api/#actions
    actions: {
        signin(context, userInfos) {
            return new Promise((resolve, reject) => {
              handler
                .post("/auth/signin", userInfos)
                .then(res => {
                  auth.setLocalAuthToken(res.data.token);
                  context.commit("setCurrent", res.data.user);
                  resolve(res);
                })
                .catch(err => {
                  auth.deleteLocalAuthToken();
                  context.commit("setCurrent", null);
                  reject(err);
                  alert("Les identifiants sont invalides !")
                });
            });
          },

          async signup(context, userInfos) {
            try {
              await handler.post("/auth/signup", userInfos);
              alert("Inscription réussie, vous pouvez vous connecter")
            } catch (err) {
                alert("Désolé, cet email ou ce pseudo ne sont pas disponible !")
              // problème au signup ...
              const method = err.response.status.toString().startsWith("4")
                ? "warn"
                : "error"; // en fonction du code de réponse http...
              console[method](err.response.data); // détermine si on utilise console.warn OU console.error pour log la réponse
            }
          },

        signout(context) {
            // kill token server side
            auth.deleteLocalAuthToken();
            context.commit("unsetCurrent");
            console.log("router ???", this.$router);
               // vm.$router.push({ path: signinPath }).catch((error) => { // si un erreur survient ...
      //   console.info(error.message); // todo : afficher le message dans une alert box
      // });
        },

        getUserByToken(context) {
            axios
                .get("auth/get-user-by-token", {
                    withCredentials: true // send token with request, server knows user connected
                })
                .then(res => context.commit("setCurrent", res.data))
                .catch(err => console.error(err.message));
        },

        getAll(context) {
            return new Promise((resolve, reject) => {
                axios
                    .get("/users/")
                    .then(res => {
                        context.commit("setUsers", res.data) // modifie store avec listes ts les users retournés par backend
                        resolve(res); // promess tenue
                    })
                    .catch(err => {
                        reject(err); // promess non tenue
                    });
            });
        },

        async update(context, userInfos) {
            return new Promise((resolve, reject) => {
                axios
                    .patch(`/users/${userInfos._id}`, userInfos)
                    .then(res => {
                        context.commit("setCurrent", res.data);
                        resolve(res);
                    })
                    .catch(err => {
                        auth.deleteLocalAuthToken();
                        context.commit("setCurrent", null);
                        reject(err)
                    });
            });
        }
    }
};