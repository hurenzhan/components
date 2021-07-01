// 节点
class Node {
  constructor(element, next) {
    this.element = element; // 主体
    this.next = next; // 关联体
  }
}

/**
 * @一
 * @链表
 * @description 链表结构类，并提供链表的操作方法
 */
class LinkedList {
  constructor() {
    this.head = null;
    this.size = 0;  // 长度，操作下标用
  }

  // 根据下标获取节点
  _getNode(index) {
    let node = this.head;
    for (let i = 0; i < index; i++) {
      node = node.next;
    }
    return node;
  }

  getNode(index) {
    if (index >= this.size) return;
    return this._getNode(index);
  }

  // 添加节点
  add(index, element) {
    if (arguments.length === 1) { // 如果只传一个参数，表明只传了节点
      element = index;
      index = this.size;
    }
    if (index > this.size) return;  // 如果索引大于长度，无法操作
    if (index === 0) {  // 0代表要替换表头，原表头后移
      const oldHead = this.head;
      this.head = new Node(element, oldHead) // 老表头放到新节点关联体
    } else {
      const prevNode = this._getNode(index - 1); // 找到前一个节点
      prevNode.next = new Node(element, prevNode.next) // 上一个节点的新关联体就是新节点，新节点的关联体就是上一个节点的老关联体关联体
    }
    this.size++;
  }

  // 删除节点
  remove(index) {
    if (index >= this.size) return;
    let removeNode; // 删除体
    if (index === 0) {  // 删除头就是把头的关联体变为新头
      removeNode = this.head;
      if (removeNode === null) return;
      this.head = removeNode.next;
    } else {
      const prevNode = this._getNode(index - 1); // 找到前一个节点
      if (!prevNode) return;
      removeNode = prevNode.next;
      prevNode.next = removeNode.next; // 前一个节点的关联体就是删除体的关联体
    }
    this.size--;
    return removeNode;
  }

  update(index, element) {
    if (index >= this.size) return;
    const node = this._getNode(index);
    node.element = element;
    return node;
  }

  // 反转-递归（性能低）
  // reverse() {
  //   function reverse(head) {
  //     if (head === null || head.next === null) return head;
  //     const newHead = reverse(head.next); // 新头变为下一个
  //     head.next.next = head; // 让下一个人的next 指向老的头
  //     head.next = null; // 老的头下一个指向是的null
  //     return newHead; // newHead和head如果有相同的element，指向的是同一个地址
  //   }
  //   return reverse(this.head);
  // }

  // 反转-循环赋值
  reverse() {
    let head = this.head;
    if (head === null || head.next === null) return head;
    let newHead = null;
    while (head) {
      const n = head.next; // 要传入下个循环用的，引用原头的下一级，防止自己的原关联体因为赋值被回收
      // 循环是从前往后头递减，所以最后一位才是第一个头。本体第一个的关联一定是null。
      // 所有每次循环中原来的新头都会变老头，所以每次循环体的关联体都是老头
      head.next = newHead;
      newHead = head; // 新头就是循环的下一个本体关联新头后的结果
      head = n;
    }
    return newHead;
  }
}

class Queue {
  constructor() {
    this.linkList = new LinkedList;
  }

  add(element) {
    this.linkList.add(element);
  }

  // 获取头并删除
  peak() {
    return this.linkList.remove(0);
  }
}

exports.LinkedList = LinkedList;
exports.Queue = Queue;