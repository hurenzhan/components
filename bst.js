// 节点
class Node {
  constructor(element, parent) {
    this.element = element;
    this.parent = parent;
    this.left = null;
    this.right = null;
  }
}

/**
 * @一
 * @树
 * @param {Function} compare
 * @description 二叉树数据结构
 */
class BST {
  constructor(compare) {
    this.root = null;
    const internalCompare = this.compare
    this.compare = compare || internalCompare;
  }

  // 搜索条件，ture左 false右
  compare(current, element) {
    return current - element > 0
  }

  // 添加节点
  add(element) {
    if (this.root === null) return this.root = new Node(element, null);
    let current = this.root;
    let parent = null;
    let compare = true;
    while (current) { // 往下找查找节点
      parent = current;
      compare = this.compare(current.element, element);
      // 没有下级，就是最底层
      if (compare) current = current.left;
      if (!compare) current = current.right;
    }
    const newNode = new Node(element, parent);
    if (compare) parent.left = newNode;
    if (!compare) parent.right = newNode;
  }

  // 前序遍历-根左右
  preorderTraversal(cb) {
    const traversal = node => {
      if (node === null) return null;
      cb(node);
      traversal(node.left);
      traversal(node.right);
    }
    traversal(this.root);
  }

  // 中序遍历-左根又
  inorderTraversal(cb) {
    const traversal = node => {
      if (node == null) return;
      traversal(node.left);
      cb(node);
      traversal(node.right);
    }
    traversal(this.root);
  }

  // 后序遍历-左右根
  postorderTraversal(cb) {
    const traversal = node => {
      if (node === null) return;
      traversal(node.left);
      traversal(node.right)
      cb(node);
    }
    traversal(this.root);
  }

  // 层序列遍历-层左右
  levelOrderTraversal(cb) {
    const stack = [this.root];
    let i = 0;  // 查找顺序数
    let currentNode;
    while (currentNode = stack[i++]) {
      cb(currentNode);
      // 遍历到每个节点都像队列添加子节点
      if (currentNode.left) stack.push(currentNode.left);
      if (currentNode.right) stack.push(currentNode.right);
    }
  }

  // 两级反转
  invertTree() {
    const traversal = node => {
      if (node === null) return;
      const rightNode = node.right;
      node.right = node.left;
      node.left = rightNode;
      traversal(node.left);
      traversal(node.right);
    }
    traversal(this.root);
    return this.root;
  }

}

const bst = new BST((current, element) => current.id - element.id > 0);
bst.add({id: 10});
bst.add({id: 6});
bst.add({id: 4});
bst.add({id: 7});
bst.add({id: 15});
bst.add({id: 11});
bst.add({id: 16});
bst.add({id: 12});
console.log(bst);
bst.levelOrderTraversal((node) => {
  console.log(node);
});
bst.invertTree();
console.log(bst);
//                10
//          6           15
//       4     7    11      16
//                      12
