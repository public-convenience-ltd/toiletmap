const _ = require('lodash');

const twodeetree = require('../2dtree');

const elements = _.sortBy(require('./data/2dtree_functions'), [
  'x',
  'y',
  'value',
]);

describe('buildTree', () => {
  it('should represent all and only the original elements', () => {
    const tree = twodeetree.buildTree(elements);
    const flattened = _.sortBy(flattenTree(tree), ['x', 'y', 'value']);

    expect(flattened).toEqual(elements);
  });

  it('should construct an empty tree (null) from an empty list', () => {
    expect(twodeetree.buildTree([])).toBeNull();
  });

  it('should not violate the rules of a 2D tree', () => {
    expect(doesObey(twodeetree.buildTree(elements))).toBeTruthy();
  });
});

describe('findInRange', () => {
  it('should find the elements in the given range', () => {
    const expected = _.sortBy(
      [
        { x: 0.1719277296998174, y: 0.7219592266803552, value: 2 },
        { x: 0.17595901894441446, y: 0.8157560238119859, value: 31 },
        { x: 0.26435058380675835, y: 0.8133199035825769, value: 56 },
        { x: 0.1072810707697951, y: 0.8322241840034001, value: 69 },
        { x: 0.14953171502182494, y: 0.8214136855171159, value: 93 },
        { x: 0.1719277296998174, y: 0.7219592266803552, value: 102 },
      ],
      ['x', 'y', 'value']
    );

    const tree = twodeetree.buildTree(elements);
    const actual = _.sortBy(twodeetree.findInRange(tree, 0.1, 0.7, 0.3, 0.9), [
      'x',
      'y',
      'value',
    ]);

    expect(actual).toEqual(expected);
  });

  it('should handle an empty tree (null) correctly', () => {
    expect(twodeetree.findInRange(null, 0.1, 0.7, 0.3, 0.9)).toHaveLength(0);
  });
});

describe('Node2D', () => {
  describe('getElement', () => {
    it('should have the same properties as its Node', () => {
      const node = twodeetree.buildTree(elements);
      const ele = node.getElement();

      expect(ele.x).toBe(node.x);
      expect(ele.y).toBe(node.y);
      expect(ele.value).toBe(node.value);
    });
  });
});

/**
 * Flatten a tree into its original elements.
 */
function flattenTree(root) {
  if (root === null) {
    // account for empty tree
    return [];
  }

  return [
    ...flattenTree(root.left),
    root.getElement(),
    ...flattenTree(root.right),
  ];
}

/**
 * See if obeys 2D Tree definition.
 */
function doesObey(
  root,
  isOdd = true,
  minX = null,
  maxX = null,
  minY = null,
  maxY = null
) {
  // account for empty tree
  if (root === null) return true;

  // check this element follows the X rules
  if (minX !== null && root.x < minX) {
    return false;
  } else if (maxX !== null && root.x >= maxX) {
    // we go right when elements are equal, so this is greater-than-or-equals not just greater-than
    return false;
  }

  // check this element follows the Y rules
  if (minY !== null && root.y < minY) {
    return false;
  } else if (maxY !== null && root.y >= maxY) {
    // we go right when elements are equal, so this is greater-than-or-equals not just greater-than
    return false;
  }

  // recurse with new limits
  if (isOdd) {
    return (
      doesObey(root.left, !isOdd, minX, root.x, minY, maxY) &&
      doesObey(root.right, !isOdd, root.x, maxX, minY, maxY)
    );
  } else {
    return (
      doesObey(root.left, !isOdd, minX, maxX, minY, root.y) &&
      doesObey(root.right, !isOdd, minX, maxX, root.y, maxY)
    );
  }
}
