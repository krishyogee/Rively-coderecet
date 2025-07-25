package models

type Customer struct {
	ID      string `json:"id"`
	Name    string `json:"name"`
	Domain  string `json:"domain"`
	Active  bool   `json:"active"`
	Created string `json:"created"`
	Updated string `json:"updated"`
}
