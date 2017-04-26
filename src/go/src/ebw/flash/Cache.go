package flash

import (
	"encoding/json"
	"fmt"
	"net/http"
	"sync"
	"time"
)

type Cache struct {
	Lock  sync.Mutex
	First *Item
	Last  *Item
}

var TheCache Cache

func Add(key string, item interface{}) error {
	return TheCache.Add(key, item)
}

func AddExpiry(key string, item interface{}, expires time.Duration) error {
	return TheCache.AddExpiry(key, item, expires)
}

func (c *Cache) Add(key string, item interface{}) error {
	return c.AddExpiry(key, item, time.Minute)
}

// Add adds the raw value to the cache for the given key
func (c *Cache) AddExpiry(key string, item interface{}, expires time.Duration) error {
	c.Lock.Lock()
	defer c.Lock.Unlock()

	// if the Last is nil, then the First will also be nil
	if nil == c.Last {
		NewItem(&c.Last, key, item, expires)
		c.First = c.Last
	} else {
		NewItem(&c.Last.Next, key, item, expires)
		c.Last = c.Last.Next
	}
	return nil
}

// FlushExpired removes all expired items from the cache
func (c *Cache) FlushExpired() {
	c.Lock.Lock()
	defer c.Lock.Unlock()
	for nil != c.First && c.First.Expired() {
		c.First = c.First.Remove(&c.First)
	}
	if nil == c.First {
		c.Last = nil
	}
}

func Find(key string) ([]interface{}, error) {
	return TheCache.Find(key)
}

func (c *Cache) Find(key string) ([]interface{}, error) {
	c.Lock.Lock()
	defer c.Lock.Unlock()

	left := &c.First
	item := c.First
	raws := make([]interface{}, 0)

	for nil != item {
		if item.Expired() {
			item = item.Remove(left)
			continue
		}
		if item.Key == key {
			raws = append(raws, item.I)
			item = item.Remove(left)
			continue
		}
		left = &(item.Next)
		item = *left
	}
	if nil == c.First {
		c.Last = nil
	}
	return raws, nil
}

func (c *Cache) WebDump(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/plain")
	for i := c.First; nil != i; i = i.Next {
		js, _ := json.Marshal(i.I)
		fmt.Fprintln(w, "%s : %s\n", i.Key, js)
	}
}

func (c *Cache) Len() int {
	c.Lock.Lock()
	defer c.Lock.Unlock()
	i := 0
	for item := c.First; nil != item; item = item.Next {
		i++
	}
	return i
}
