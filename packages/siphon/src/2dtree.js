/**
 * Build a 2D tree from a list of elements.
 */
exports.buildTree = function(elements) {
  return buildTree(elements.map(ele => new Node2D(ele)));
};

/**
 * Find all elements within a given 2D range within the tree.
 */
exports.findInRange = function(root, minX, minY, maxX, maxY, oddDepth = true) {
  // account for empty tree
  if (root === null) {
    return [];
  }

  // alternate dimensions at each layer
  const pos = oddDepth ? root.x : root.y;
  const min = oddDepth ? minX : minY;
  const max = oddDepth ? maxX : maxY;

  // if we can rule out this node and elements to one side of it, do it
  if (pos < min) {
    return exports.findInRange(root.right, minX, minY, maxX, maxY, !oddDepth);
  } else if (pos > max) {
    return exports.findInRange(root.left, minX, minY, maxX, maxY, !oddDepth);
  }

  // we have to consider everything else, we couldn't rule either side out
  const inRange = [
    ...exports.findInRange(root.left, minX, minY, maxX, maxY, !oddDepth),
    ...exports.findInRange(root.right, minX, minY, maxX, maxY, !oddDepth),
  ];

  // is root itself a candidate?
  const oPos = oddDepth ? root.y : root.x;
  const oMin = oddDepth ? minY : minX;
  const oMax = oddDepth ? maxY : maxX;
  if (oPos >= oMin && oPos <= oMax) {
    inRange.push(root.getElement());
  }

  return inRange;
};

/**
 * Represents a Node in a 2D Tree.
 *
 * A 2D Tree can be represented as an array if this gets slow.
 */
class Node2D {
  constructor(element, left = null, right = null) {
    this.x = element.x;
    this.y = element.y;
    this.value = element.value;

    this.left = left;
    this.right = right;
  }

  getElement() {
    return {
      x: this.x,
      y: this.y,
      value: this.value,
    };
  }
}

/**
 * Build a 2D tree from a list of childless nodes.
 */
function buildTree(nodes, oddDepth = true) {
  if (nodes.length == 0) {
    // empty 2D tree has null root
    return null;
  }

  // find the median of the dimension, alternating dimension at each layer
  const positions = nodes.map(node => (oddDepth ? node.x : node.y));
  const median = slowMedian(positions);

  // partition
  const left = [];
  const right = [];
  let middle = null;
  for (let node of nodes) {
    // alternate dimension at each layer
    const pos = oddDepth ? node.x : node.y;

    if (pos < median) {
      left.push(node);
    } else if (pos > median) {
      right.push(node);
    } else {
      if (middle == null) {
        // choose as middle node
        middle = node;
      } else {
        // already got middle node, put on the right

        // TODO can we have more balanced trees while preserving fast removal without
        // assuming a specific direction for duplicates?
        right.push(node);
      }
    }
  }

  // construct child trees
  middle.left = buildTree(left, !oddDepth);
  middle.right = buildTree(right, !oddDepth);

  return middle;
}

/**
 * Naively find the median by sorting, in O(n log n).
 */
function slowMedian(list) {
  list.sort((a, b) => a - b); // sort as numbers, not strings
  return list[Math.floor(list.length / 2)];
}
