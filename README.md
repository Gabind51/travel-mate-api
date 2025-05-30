## Travel Mate API

| Critère                                                                     | Requête Postman      | Présent ? |
| --------------------------------------------------------------------------- | -------------------- | --------- |
| **Endpoints CRUD**                                                          |                      |
| Lister tout                                                                 | Users/GetAll         | Oui       |
| Lister tout                                                                 | Users/GetAll         | Oui       |
| Afficher un élément par ID                                                  | Trips/Get trip by ID | Oui       |
| Lister via une recherche sur tous les champs                                |                      | Oui       |
| Créer                                                                       | Trips/Create trip    | Oui       |
| Mettre à jour un élément par son ID                                         | Trips/Update trip    | Oui       |
| Supprimer un élément par son ID                                             | Trips/Delete trip    | Oui       |
| Supprimer plusieurs éléments par une liste d'ID                             | Trips/Delete trips   | Oui       |
| Réinitialiser la BD                                                         | Admin/Reset Database | Oui       |
| **Authentification**                                                        |
| Table users (nom, email, mot de passe, isAdmin)                             |                      | Oui       |
| Table initialisée avec un admin                                             |                      | Oui       |
| Verbe d'inscription                                                         | Users/Register       | Oui       |
| Verbe de connexion                                                          | User/Login           | Oui       |
| Tous les verbes sont protégés par un middleware d'authentification          |                      | Oui       |
| Verbe pour qu'un utilisateur puisse mettre à jour ses informations          | Users/Update user    | Oui       |
| Protection du verbe de réinitialisation de la BD uniquement pour les admins | Admin/Reset database | Oui       |
| **Autres**                                                                  |
| Fichier de requêtes                                                         |                      | Oui       |
| Gestion des erreurs et validation des données                               |                      | Oui       |
| Logging des évenements                                                      |                      | Oui       |
| Déploiement sur un hébergeur gratuit                                        |                      |
| **Note**                                                                    |                      | 17        |
