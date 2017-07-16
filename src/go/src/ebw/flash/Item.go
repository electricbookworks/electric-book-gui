package flash

import (
	"time"
)

type Item struct {
	Key    string
	Expiry time.Time
	I      interface{}
	Next   *Item
}

// NewItem creates a new cache Item with the given key and raw data,
// and adds the item into the cache, setting the last item pointer of the cache
func NewItem(leftNext **Item, key string, i interface{}, expires time.Duration) *Item {
	item := &Item{key, time.Now().Add(expires), i, *leftNext}
	*leftNext = item
	return item
}

// Remove removes the item from the linked list. It requires the pointer to the
// element to its left, and returns the next item in the list.
func (item *Item) Remove(leftNext **Item) *Item {
	*leftNext = item.Next
	return item.Next
}

// Expired returns true if the item is expired
func (item *Item) Expired() bool {
	return time.Now().After(item.Expiry)
}
