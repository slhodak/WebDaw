const Helpers = {
  indexOf(collection, target) {
    for (let i = 0; i < collection.length; i++) {
      if (collection[i] === target) {
        return i;
      }
    }
    return -1;
  },
  getRouteRelationship(source, destination) {
    if (source.dest === destination) {
      return 'connected';
    } else if (Helpers.isNodeLoop(source, destination)) {
      return 'ineligible';
    } else {
      return 'eligible';
    }
  },
  isNodeLoop(source, destination) {
    while(destination) {
      if (source === destination) {
        return true;
      }
      destination = destination.dest;
    }
    return false;
  },
  LL: {
    removeHead(list) {
      list.head = list.head.next;
      return list.head;
    },
    addToTail(list, node) {
      if (!list.head) {
        list.head = node;
        return;
      }
      if (!list.tail) {
        list.head.next = node;
      } else {
        list.tail.next = node;
      }
      list.tail = node; 
    },
    changeAllNodes(list, cb) {
      let head = list.head;
      while(head) {
        cb(head);
        head = head.next;
      }
    }
  }
}

export default Helpers;