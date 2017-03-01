
(function() {
'use strict';

function F2(fun)
{
  function wrapper(a) { return function(b) { return fun(a,b); }; }
  wrapper.arity = 2;
  wrapper.func = fun;
  return wrapper;
}

function F3(fun)
{
  function wrapper(a) {
    return function(b) { return function(c) { return fun(a, b, c); }; };
  }
  wrapper.arity = 3;
  wrapper.func = fun;
  return wrapper;
}

function F4(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return fun(a, b, c, d); }; }; };
  }
  wrapper.arity = 4;
  wrapper.func = fun;
  return wrapper;
}

function F5(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return fun(a, b, c, d, e); }; }; }; };
  }
  wrapper.arity = 5;
  wrapper.func = fun;
  return wrapper;
}

function F6(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return fun(a, b, c, d, e, f); }; }; }; }; };
  }
  wrapper.arity = 6;
  wrapper.func = fun;
  return wrapper;
}

function F7(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return fun(a, b, c, d, e, f, g); }; }; }; }; }; };
  }
  wrapper.arity = 7;
  wrapper.func = fun;
  return wrapper;
}

function F8(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return function(h) {
    return fun(a, b, c, d, e, f, g, h); }; }; }; }; }; }; };
  }
  wrapper.arity = 8;
  wrapper.func = fun;
  return wrapper;
}

function F9(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return function(h) { return function(i) {
    return fun(a, b, c, d, e, f, g, h, i); }; }; }; }; }; }; }; };
  }
  wrapper.arity = 9;
  wrapper.func = fun;
  return wrapper;
}

function A2(fun, a, b)
{
  return fun.arity === 2
    ? fun.func(a, b)
    : fun(a)(b);
}
function A3(fun, a, b, c)
{
  return fun.arity === 3
    ? fun.func(a, b, c)
    : fun(a)(b)(c);
}
function A4(fun, a, b, c, d)
{
  return fun.arity === 4
    ? fun.func(a, b, c, d)
    : fun(a)(b)(c)(d);
}
function A5(fun, a, b, c, d, e)
{
  return fun.arity === 5
    ? fun.func(a, b, c, d, e)
    : fun(a)(b)(c)(d)(e);
}
function A6(fun, a, b, c, d, e, f)
{
  return fun.arity === 6
    ? fun.func(a, b, c, d, e, f)
    : fun(a)(b)(c)(d)(e)(f);
}
function A7(fun, a, b, c, d, e, f, g)
{
  return fun.arity === 7
    ? fun.func(a, b, c, d, e, f, g)
    : fun(a)(b)(c)(d)(e)(f)(g);
}
function A8(fun, a, b, c, d, e, f, g, h)
{
  return fun.arity === 8
    ? fun.func(a, b, c, d, e, f, g, h)
    : fun(a)(b)(c)(d)(e)(f)(g)(h);
}
function A9(fun, a, b, c, d, e, f, g, h, i)
{
  return fun.arity === 9
    ? fun.func(a, b, c, d, e, f, g, h, i)
    : fun(a)(b)(c)(d)(e)(f)(g)(h)(i);
}

//import Native.List //

var _elm_lang$core$Native_Array = function() {

// A RRB-Tree has two distinct data types.
// Leaf -> "height"  is always 0
//         "table"   is an array of elements
// Node -> "height"  is always greater than 0
//         "table"   is an array of child nodes
//         "lengths" is an array of accumulated lengths of the child nodes

// M is the maximal table size. 32 seems fast. E is the allowed increase
// of search steps when concatting to find an index. Lower values will
// decrease balancing, but will increase search steps.
var M = 32;
var E = 2;

// An empty array.
var empty = {
	ctor: '_Array',
	height: 0,
	table: []
};


function get(i, array)
{
	if (i < 0 || i >= length(array))
	{
		throw new Error(
			'Index ' + i + ' is out of range. Check the length of ' +
			'your array first or use getMaybe or getWithDefault.');
	}
	return unsafeGet(i, array);
}


function unsafeGet(i, array)
{
	for (var x = array.height; x > 0; x--)
	{
		var slot = i >> (x * 5);
		while (array.lengths[slot] <= i)
		{
			slot++;
		}
		if (slot > 0)
		{
			i -= array.lengths[slot - 1];
		}
		array = array.table[slot];
	}
	return array.table[i];
}


// Sets the value at the index i. Only the nodes leading to i will get
// copied and updated.
function set(i, item, array)
{
	if (i < 0 || length(array) <= i)
	{
		return array;
	}
	return unsafeSet(i, item, array);
}


function unsafeSet(i, item, array)
{
	array = nodeCopy(array);

	if (array.height === 0)
	{
		array.table[i] = item;
	}
	else
	{
		var slot = getSlot(i, array);
		if (slot > 0)
		{
			i -= array.lengths[slot - 1];
		}
		array.table[slot] = unsafeSet(i, item, array.table[slot]);
	}
	return array;
}


function initialize(len, f)
{
	if (len <= 0)
	{
		return empty;
	}
	var h = Math.floor( Math.log(len) / Math.log(M) );
	return initialize_(f, h, 0, len);
}

function initialize_(f, h, from, to)
{
	if (h === 0)
	{
		var table = new Array((to - from) % (M + 1));
		for (var i = 0; i < table.length; i++)
		{
		  table[i] = f(from + i);
		}
		return {
			ctor: '_Array',
			height: 0,
			table: table
		};
	}

	var step = Math.pow(M, h);
	var table = new Array(Math.ceil((to - from) / step));
	var lengths = new Array(table.length);
	for (var i = 0; i < table.length; i++)
	{
		table[i] = initialize_(f, h - 1, from + (i * step), Math.min(from + ((i + 1) * step), to));
		lengths[i] = length(table[i]) + (i > 0 ? lengths[i-1] : 0);
	}
	return {
		ctor: '_Array',
		height: h,
		table: table,
		lengths: lengths
	};
}

function fromList(list)
{
	if (list.ctor === '[]')
	{
		return empty;
	}

	// Allocate M sized blocks (table) and write list elements to it.
	var table = new Array(M);
	var nodes = [];
	var i = 0;

	while (list.ctor !== '[]')
	{
		table[i] = list._0;
		list = list._1;
		i++;

		// table is full, so we can push a leaf containing it into the
		// next node.
		if (i === M)
		{
			var leaf = {
				ctor: '_Array',
				height: 0,
				table: table
			};
			fromListPush(leaf, nodes);
			table = new Array(M);
			i = 0;
		}
	}

	// Maybe there is something left on the table.
	if (i > 0)
	{
		var leaf = {
			ctor: '_Array',
			height: 0,
			table: table.splice(0, i)
		};
		fromListPush(leaf, nodes);
	}

	// Go through all of the nodes and eventually push them into higher nodes.
	for (var h = 0; h < nodes.length - 1; h++)
	{
		if (nodes[h].table.length > 0)
		{
			fromListPush(nodes[h], nodes);
		}
	}

	var head = nodes[nodes.length - 1];
	if (head.height > 0 && head.table.length === 1)
	{
		return head.table[0];
	}
	else
	{
		return head;
	}
}

// Push a node into a higher node as a child.
function fromListPush(toPush, nodes)
{
	var h = toPush.height;

	// Maybe the node on this height does not exist.
	if (nodes.length === h)
	{
		var node = {
			ctor: '_Array',
			height: h + 1,
			table: [],
			lengths: []
		};
		nodes.push(node);
	}

	nodes[h].table.push(toPush);
	var len = length(toPush);
	if (nodes[h].lengths.length > 0)
	{
		len += nodes[h].lengths[nodes[h].lengths.length - 1];
	}
	nodes[h].lengths.push(len);

	if (nodes[h].table.length === M)
	{
		fromListPush(nodes[h], nodes);
		nodes[h] = {
			ctor: '_Array',
			height: h + 1,
			table: [],
			lengths: []
		};
	}
}

// Pushes an item via push_ to the bottom right of a tree.
function push(item, a)
{
	var pushed = push_(item, a);
	if (pushed !== null)
	{
		return pushed;
	}

	var newTree = create(item, a.height);
	return siblise(a, newTree);
}

// Recursively tries to push an item to the bottom-right most
// tree possible. If there is no space left for the item,
// null will be returned.
function push_(item, a)
{
	// Handle resursion stop at leaf level.
	if (a.height === 0)
	{
		if (a.table.length < M)
		{
			var newA = {
				ctor: '_Array',
				height: 0,
				table: a.table.slice()
			};
			newA.table.push(item);
			return newA;
		}
		else
		{
		  return null;
		}
	}

	// Recursively push
	var pushed = push_(item, botRight(a));

	// There was space in the bottom right tree, so the slot will
	// be updated.
	if (pushed !== null)
	{
		var newA = nodeCopy(a);
		newA.table[newA.table.length - 1] = pushed;
		newA.lengths[newA.lengths.length - 1]++;
		return newA;
	}

	// When there was no space left, check if there is space left
	// for a new slot with a tree which contains only the item
	// at the bottom.
	if (a.table.length < M)
	{
		var newSlot = create(item, a.height - 1);
		var newA = nodeCopy(a);
		newA.table.push(newSlot);
		newA.lengths.push(newA.lengths[newA.lengths.length - 1] + length(newSlot));
		return newA;
	}
	else
	{
		return null;
	}
}

// Converts an array into a list of elements.
function toList(a)
{
	return toList_(_elm_lang$core$Native_List.Nil, a);
}

function toList_(list, a)
{
	for (var i = a.table.length - 1; i >= 0; i--)
	{
		list =
			a.height === 0
				? _elm_lang$core$Native_List.Cons(a.table[i], list)
				: toList_(list, a.table[i]);
	}
	return list;
}

// Maps a function over the elements of an array.
function map(f, a)
{
	var newA = {
		ctor: '_Array',
		height: a.height,
		table: new Array(a.table.length)
	};
	if (a.height > 0)
	{
		newA.lengths = a.lengths;
	}
	for (var i = 0; i < a.table.length; i++)
	{
		newA.table[i] =
			a.height === 0
				? f(a.table[i])
				: map(f, a.table[i]);
	}
	return newA;
}

// Maps a function over the elements with their index as first argument.
function indexedMap(f, a)
{
	return indexedMap_(f, a, 0);
}

function indexedMap_(f, a, from)
{
	var newA = {
		ctor: '_Array',
		height: a.height,
		table: new Array(a.table.length)
	};
	if (a.height > 0)
	{
		newA.lengths = a.lengths;
	}
	for (var i = 0; i < a.table.length; i++)
	{
		newA.table[i] =
			a.height === 0
				? A2(f, from + i, a.table[i])
				: indexedMap_(f, a.table[i], i == 0 ? from : from + a.lengths[i - 1]);
	}
	return newA;
}

function foldl(f, b, a)
{
	if (a.height === 0)
	{
		for (var i = 0; i < a.table.length; i++)
		{
			b = A2(f, a.table[i], b);
		}
	}
	else
	{
		for (var i = 0; i < a.table.length; i++)
		{
			b = foldl(f, b, a.table[i]);
		}
	}
	return b;
}

function foldr(f, b, a)
{
	if (a.height === 0)
	{
		for (var i = a.table.length; i--; )
		{
			b = A2(f, a.table[i], b);
		}
	}
	else
	{
		for (var i = a.table.length; i--; )
		{
			b = foldr(f, b, a.table[i]);
		}
	}
	return b;
}

// TODO: currently, it slices the right, then the left. This can be
// optimized.
function slice(from, to, a)
{
	if (from < 0)
	{
		from += length(a);
	}
	if (to < 0)
	{
		to += length(a);
	}
	return sliceLeft(from, sliceRight(to, a));
}

function sliceRight(to, a)
{
	if (to === length(a))
	{
		return a;
	}

	// Handle leaf level.
	if (a.height === 0)
	{
		var newA = { ctor:'_Array', height:0 };
		newA.table = a.table.slice(0, to);
		return newA;
	}

	// Slice the right recursively.
	var right = getSlot(to, a);
	var sliced = sliceRight(to - (right > 0 ? a.lengths[right - 1] : 0), a.table[right]);

	// Maybe the a node is not even needed, as sliced contains the whole slice.
	if (right === 0)
	{
		return sliced;
	}

	// Create new node.
	var newA = {
		ctor: '_Array',
		height: a.height,
		table: a.table.slice(0, right),
		lengths: a.lengths.slice(0, right)
	};
	if (sliced.table.length > 0)
	{
		newA.table[right] = sliced;
		newA.lengths[right] = length(sliced) + (right > 0 ? newA.lengths[right - 1] : 0);
	}
	return newA;
}

function sliceLeft(from, a)
{
	if (from === 0)
	{
		return a;
	}

	// Handle leaf level.
	if (a.height === 0)
	{
		var newA = { ctor:'_Array', height:0 };
		newA.table = a.table.slice(from, a.table.length + 1);
		return newA;
	}

	// Slice the left recursively.
	var left = getSlot(from, a);
	var sliced = sliceLeft(from - (left > 0 ? a.lengths[left - 1] : 0), a.table[left]);

	// Maybe the a node is not even needed, as sliced contains the whole slice.
	if (left === a.table.length - 1)
	{
		return sliced;
	}

	// Create new node.
	var newA = {
		ctor: '_Array',
		height: a.height,
		table: a.table.slice(left, a.table.length + 1),
		lengths: new Array(a.table.length - left)
	};
	newA.table[0] = sliced;
	var len = 0;
	for (var i = 0; i < newA.table.length; i++)
	{
		len += length(newA.table[i]);
		newA.lengths[i] = len;
	}

	return newA;
}

// Appends two trees.
function append(a,b)
{
	if (a.table.length === 0)
	{
		return b;
	}
	if (b.table.length === 0)
	{
		return a;
	}

	var c = append_(a, b);

	// Check if both nodes can be crunshed together.
	if (c[0].table.length + c[1].table.length <= M)
	{
		if (c[0].table.length === 0)
		{
			return c[1];
		}
		if (c[1].table.length === 0)
		{
			return c[0];
		}

		// Adjust .table and .lengths
		c[0].table = c[0].table.concat(c[1].table);
		if (c[0].height > 0)
		{
			var len = length(c[0]);
			for (var i = 0; i < c[1].lengths.length; i++)
			{
				c[1].lengths[i] += len;
			}
			c[0].lengths = c[0].lengths.concat(c[1].lengths);
		}

		return c[0];
	}

	if (c[0].height > 0)
	{
		var toRemove = calcToRemove(a, b);
		if (toRemove > E)
		{
			c = shuffle(c[0], c[1], toRemove);
		}
	}

	return siblise(c[0], c[1]);
}

// Returns an array of two nodes; right and left. One node _may_ be empty.
function append_(a, b)
{
	if (a.height === 0 && b.height === 0)
	{
		return [a, b];
	}

	if (a.height !== 1 || b.height !== 1)
	{
		if (a.height === b.height)
		{
			a = nodeCopy(a);
			b = nodeCopy(b);
			var appended = append_(botRight(a), botLeft(b));

			insertRight(a, appended[1]);
			insertLeft(b, appended[0]);
		}
		else if (a.height > b.height)
		{
			a = nodeCopy(a);
			var appended = append_(botRight(a), b);

			insertRight(a, appended[0]);
			b = parentise(appended[1], appended[1].height + 1);
		}
		else
		{
			b = nodeCopy(b);
			var appended = append_(a, botLeft(b));

			var left = appended[0].table.length === 0 ? 0 : 1;
			var right = left === 0 ? 1 : 0;
			insertLeft(b, appended[left]);
			a = parentise(appended[right], appended[right].height + 1);
		}
	}

	// Check if balancing is needed and return based on that.
	if (a.table.length === 0 || b.table.length === 0)
	{
		return [a, b];
	}

	var toRemove = calcToRemove(a, b);
	if (toRemove <= E)
	{
		return [a, b];
	}
	return shuffle(a, b, toRemove);
}

// Helperfunctions for append_. Replaces a child node at the side of the parent.
function insertRight(parent, node)
{
	var index = parent.table.length - 1;
	parent.table[index] = node;
	parent.lengths[index] = length(node);
	parent.lengths[index] += index > 0 ? parent.lengths[index - 1] : 0;
}

function insertLeft(parent, node)
{
	if (node.table.length > 0)
	{
		parent.table[0] = node;
		parent.lengths[0] = length(node);

		var len = length(parent.table[0]);
		for (var i = 1; i < parent.lengths.length; i++)
		{
			len += length(parent.table[i]);
			parent.lengths[i] = len;
		}
	}
	else
	{
		parent.table.shift();
		for (var i = 1; i < parent.lengths.length; i++)
		{
			parent.lengths[i] = parent.lengths[i] - parent.lengths[0];
		}
		parent.lengths.shift();
	}
}

// Returns the extra search steps for E. Refer to the paper.
function calcToRemove(a, b)
{
	var subLengths = 0;
	for (var i = 0; i < a.table.length; i++)
	{
		subLengths += a.table[i].table.length;
	}
	for (var i = 0; i < b.table.length; i++)
	{
		subLengths += b.table[i].table.length;
	}

	var toRemove = a.table.length + b.table.length;
	return toRemove - (Math.floor((subLengths - 1) / M) + 1);
}

// get2, set2 and saveSlot are helpers for accessing elements over two arrays.
function get2(a, b, index)
{
	return index < a.length
		? a[index]
		: b[index - a.length];
}

function set2(a, b, index, value)
{
	if (index < a.length)
	{
		a[index] = value;
	}
	else
	{
		b[index - a.length] = value;
	}
}

function saveSlot(a, b, index, slot)
{
	set2(a.table, b.table, index, slot);

	var l = (index === 0 || index === a.lengths.length)
		? 0
		: get2(a.lengths, a.lengths, index - 1);

	set2(a.lengths, b.lengths, index, l + length(slot));
}

// Creates a node or leaf with a given length at their arrays for perfomance.
// Is only used by shuffle.
function createNode(h, length)
{
	if (length < 0)
	{
		length = 0;
	}
	var a = {
		ctor: '_Array',
		height: h,
		table: new Array(length)
	};
	if (h > 0)
	{
		a.lengths = new Array(length);
	}
	return a;
}

// Returns an array of two balanced nodes.
function shuffle(a, b, toRemove)
{
	var newA = createNode(a.height, Math.min(M, a.table.length + b.table.length - toRemove));
	var newB = createNode(a.height, newA.table.length - (a.table.length + b.table.length - toRemove));

	// Skip the slots with size M. More precise: copy the slot references
	// to the new node
	var read = 0;
	while (get2(a.table, b.table, read).table.length % M === 0)
	{
		set2(newA.table, newB.table, read, get2(a.table, b.table, read));
		set2(newA.lengths, newB.lengths, read, get2(a.lengths, b.lengths, read));
		read++;
	}

	// Pulling items from left to right, caching in a slot before writing
	// it into the new nodes.
	var write = read;
	var slot = new createNode(a.height - 1, 0);
	var from = 0;

	// If the current slot is still containing data, then there will be at
	// least one more write, so we do not break this loop yet.
	while (read - write - (slot.table.length > 0 ? 1 : 0) < toRemove)
	{
		// Find out the max possible items for copying.
		var source = get2(a.table, b.table, read);
		var to = Math.min(M - slot.table.length, source.table.length);

		// Copy and adjust size table.
		slot.table = slot.table.concat(source.table.slice(from, to));
		if (slot.height > 0)
		{
			var len = slot.lengths.length;
			for (var i = len; i < len + to - from; i++)
			{
				slot.lengths[i] = length(slot.table[i]);
				slot.lengths[i] += (i > 0 ? slot.lengths[i - 1] : 0);
			}
		}

		from += to;

		// Only proceed to next slots[i] if the current one was
		// fully copied.
		if (source.table.length <= to)
		{
			read++; from = 0;
		}

		// Only create a new slot if the current one is filled up.
		if (slot.table.length === M)
		{
			saveSlot(newA, newB, write, slot);
			slot = createNode(a.height - 1, 0);
			write++;
		}
	}

	// Cleanup after the loop. Copy the last slot into the new nodes.
	if (slot.table.length > 0)
	{
		saveSlot(newA, newB, write, slot);
		write++;
	}

	// Shift the untouched slots to the left
	while (read < a.table.length + b.table.length )
	{
		saveSlot(newA, newB, write, get2(a.table, b.table, read));
		read++;
		write++;
	}

	return [newA, newB];
}

// Navigation functions
function botRight(a)
{
	return a.table[a.table.length - 1];
}
function botLeft(a)
{
	return a.table[0];
}

// Copies a node for updating. Note that you should not use this if
// only updating only one of "table" or "lengths" for performance reasons.
function nodeCopy(a)
{
	var newA = {
		ctor: '_Array',
		height: a.height,
		table: a.table.slice()
	};
	if (a.height > 0)
	{
		newA.lengths = a.lengths.slice();
	}
	return newA;
}

// Returns how many items are in the tree.
function length(array)
{
	if (array.height === 0)
	{
		return array.table.length;
	}
	else
	{
		return array.lengths[array.lengths.length - 1];
	}
}

// Calculates in which slot of "table" the item probably is, then
// find the exact slot via forward searching in  "lengths". Returns the index.
function getSlot(i, a)
{
	var slot = i >> (5 * a.height);
	while (a.lengths[slot] <= i)
	{
		slot++;
	}
	return slot;
}

// Recursively creates a tree with a given height containing
// only the given item.
function create(item, h)
{
	if (h === 0)
	{
		return {
			ctor: '_Array',
			height: 0,
			table: [item]
		};
	}
	return {
		ctor: '_Array',
		height: h,
		table: [create(item, h - 1)],
		lengths: [1]
	};
}

// Recursively creates a tree that contains the given tree.
function parentise(tree, h)
{
	if (h === tree.height)
	{
		return tree;
	}

	return {
		ctor: '_Array',
		height: h,
		table: [parentise(tree, h - 1)],
		lengths: [length(tree)]
	};
}

// Emphasizes blood brotherhood beneath two trees.
function siblise(a, b)
{
	return {
		ctor: '_Array',
		height: a.height + 1,
		table: [a, b],
		lengths: [length(a), length(a) + length(b)]
	};
}

function toJSArray(a)
{
	var jsArray = new Array(length(a));
	toJSArray_(jsArray, 0, a);
	return jsArray;
}

function toJSArray_(jsArray, i, a)
{
	for (var t = 0; t < a.table.length; t++)
	{
		if (a.height === 0)
		{
			jsArray[i + t] = a.table[t];
		}
		else
		{
			var inc = t === 0 ? 0 : a.lengths[t - 1];
			toJSArray_(jsArray, i + inc, a.table[t]);
		}
	}
}

function fromJSArray(jsArray)
{
	if (jsArray.length === 0)
	{
		return empty;
	}
	var h = Math.floor(Math.log(jsArray.length) / Math.log(M));
	return fromJSArray_(jsArray, h, 0, jsArray.length);
}

function fromJSArray_(jsArray, h, from, to)
{
	if (h === 0)
	{
		return {
			ctor: '_Array',
			height: 0,
			table: jsArray.slice(from, to)
		};
	}

	var step = Math.pow(M, h);
	var table = new Array(Math.ceil((to - from) / step));
	var lengths = new Array(table.length);
	for (var i = 0; i < table.length; i++)
	{
		table[i] = fromJSArray_(jsArray, h - 1, from + (i * step), Math.min(from + ((i + 1) * step), to));
		lengths[i] = length(table[i]) + (i > 0 ? lengths[i - 1] : 0);
	}
	return {
		ctor: '_Array',
		height: h,
		table: table,
		lengths: lengths
	};
}

return {
	empty: empty,
	fromList: fromList,
	toList: toList,
	initialize: F2(initialize),
	append: F2(append),
	push: F2(push),
	slice: F3(slice),
	get: F2(get),
	set: F3(set),
	map: F2(map),
	indexedMap: F2(indexedMap),
	foldl: F3(foldl),
	foldr: F3(foldr),
	length: length,

	toJSArray: toJSArray,
	fromJSArray: fromJSArray
};

}();
//import Native.Utils //

var _elm_lang$core$Native_Basics = function() {

function div(a, b)
{
	return (a / b) | 0;
}
function rem(a, b)
{
	return a % b;
}
function mod(a, b)
{
	if (b === 0)
	{
		throw new Error('Cannot perform mod 0. Division by zero error.');
	}
	var r = a % b;
	var m = a === 0 ? 0 : (b > 0 ? (a >= 0 ? r : r + b) : -mod(-a, -b));

	return m === b ? 0 : m;
}
function logBase(base, n)
{
	return Math.log(n) / Math.log(base);
}
function negate(n)
{
	return -n;
}
function abs(n)
{
	return n < 0 ? -n : n;
}

function min(a, b)
{
	return _elm_lang$core$Native_Utils.cmp(a, b) < 0 ? a : b;
}
function max(a, b)
{
	return _elm_lang$core$Native_Utils.cmp(a, b) > 0 ? a : b;
}
function clamp(lo, hi, n)
{
	return _elm_lang$core$Native_Utils.cmp(n, lo) < 0
		? lo
		: _elm_lang$core$Native_Utils.cmp(n, hi) > 0
			? hi
			: n;
}

var ord = ['LT', 'EQ', 'GT'];

function compare(x, y)
{
	return { ctor: ord[_elm_lang$core$Native_Utils.cmp(x, y) + 1] };
}

function xor(a, b)
{
	return a !== b;
}
function not(b)
{
	return !b;
}
function isInfinite(n)
{
	return n === Infinity || n === -Infinity;
}

function truncate(n)
{
	return n | 0;
}

function degrees(d)
{
	return d * Math.PI / 180;
}
function turns(t)
{
	return 2 * Math.PI * t;
}
function fromPolar(point)
{
	var r = point._0;
	var t = point._1;
	return _elm_lang$core$Native_Utils.Tuple2(r * Math.cos(t), r * Math.sin(t));
}
function toPolar(point)
{
	var x = point._0;
	var y = point._1;
	return _elm_lang$core$Native_Utils.Tuple2(Math.sqrt(x * x + y * y), Math.atan2(y, x));
}

return {
	div: F2(div),
	rem: F2(rem),
	mod: F2(mod),

	pi: Math.PI,
	e: Math.E,
	cos: Math.cos,
	sin: Math.sin,
	tan: Math.tan,
	acos: Math.acos,
	asin: Math.asin,
	atan: Math.atan,
	atan2: F2(Math.atan2),

	degrees: degrees,
	turns: turns,
	fromPolar: fromPolar,
	toPolar: toPolar,

	sqrt: Math.sqrt,
	logBase: F2(logBase),
	negate: negate,
	abs: abs,
	min: F2(min),
	max: F2(max),
	clamp: F3(clamp),
	compare: F2(compare),

	xor: F2(xor),
	not: not,

	truncate: truncate,
	ceiling: Math.ceil,
	floor: Math.floor,
	round: Math.round,
	toFloat: function(x) { return x; },
	isNaN: isNaN,
	isInfinite: isInfinite
};

}();
//import //

var _elm_lang$core$Native_Utils = function() {

// COMPARISONS

function eq(x, y)
{
	var stack = [];
	var isEqual = eqHelp(x, y, 0, stack);
	var pair;
	while (isEqual && (pair = stack.pop()))
	{
		isEqual = eqHelp(pair.x, pair.y, 0, stack);
	}
	return isEqual;
}


function eqHelp(x, y, depth, stack)
{
	if (depth > 100)
	{
		stack.push({ x: x, y: y });
		return true;
	}

	if (x === y)
	{
		return true;
	}

	if (typeof x !== 'object')
	{
		if (typeof x === 'function')
		{
			throw new Error(
				'Trying to use `(==)` on functions. There is no way to know if functions are "the same" in the Elm sense.'
				+ ' Read more about this at http://package.elm-lang.org/packages/elm-lang/core/latest/Basics#=='
				+ ' which describes why it is this way and what the better version will look like.'
			);
		}
		return false;
	}

	if (x === null || y === null)
	{
		return false
	}

	if (x instanceof Date)
	{
		return x.getTime() === y.getTime();
	}

	if (!('ctor' in x))
	{
		for (var key in x)
		{
			if (!eqHelp(x[key], y[key], depth + 1, stack))
			{
				return false;
			}
		}
		return true;
	}

	// convert Dicts and Sets to lists
	if (x.ctor === 'RBNode_elm_builtin' || x.ctor === 'RBEmpty_elm_builtin')
	{
		x = _elm_lang$core$Dict$toList(x);
		y = _elm_lang$core$Dict$toList(y);
	}
	if (x.ctor === 'Set_elm_builtin')
	{
		x = _elm_lang$core$Set$toList(x);
		y = _elm_lang$core$Set$toList(y);
	}

	// check if lists are equal without recursion
	if (x.ctor === '::')
	{
		var a = x;
		var b = y;
		while (a.ctor === '::' && b.ctor === '::')
		{
			if (!eqHelp(a._0, b._0, depth + 1, stack))
			{
				return false;
			}
			a = a._1;
			b = b._1;
		}
		return a.ctor === b.ctor;
	}

	// check if Arrays are equal
	if (x.ctor === '_Array')
	{
		var xs = _elm_lang$core$Native_Array.toJSArray(x);
		var ys = _elm_lang$core$Native_Array.toJSArray(y);
		if (xs.length !== ys.length)
		{
			return false;
		}
		for (var i = 0; i < xs.length; i++)
		{
			if (!eqHelp(xs[i], ys[i], depth + 1, stack))
			{
				return false;
			}
		}
		return true;
	}

	if (!eqHelp(x.ctor, y.ctor, depth + 1, stack))
	{
		return false;
	}

	for (var key in x)
	{
		if (!eqHelp(x[key], y[key], depth + 1, stack))
		{
			return false;
		}
	}
	return true;
}

// Code in Generate/JavaScript.hs, Basics.js, and List.js depends on
// the particular integer values assigned to LT, EQ, and GT.

var LT = -1, EQ = 0, GT = 1;

function cmp(x, y)
{
	if (typeof x !== 'object')
	{
		return x === y ? EQ : x < y ? LT : GT;
	}

	if (x instanceof String)
	{
		var a = x.valueOf();
		var b = y.valueOf();
		return a === b ? EQ : a < b ? LT : GT;
	}

	if (x.ctor === '::' || x.ctor === '[]')
	{
		while (x.ctor === '::' && y.ctor === '::')
		{
			var ord = cmp(x._0, y._0);
			if (ord !== EQ)
			{
				return ord;
			}
			x = x._1;
			y = y._1;
		}
		return x.ctor === y.ctor ? EQ : x.ctor === '[]' ? LT : GT;
	}

	if (x.ctor.slice(0, 6) === '_Tuple')
	{
		var ord;
		var n = x.ctor.slice(6) - 0;
		var err = 'cannot compare tuples with more than 6 elements.';
		if (n === 0) return EQ;
		if (n >= 1) { ord = cmp(x._0, y._0); if (ord !== EQ) return ord;
		if (n >= 2) { ord = cmp(x._1, y._1); if (ord !== EQ) return ord;
		if (n >= 3) { ord = cmp(x._2, y._2); if (ord !== EQ) return ord;
		if (n >= 4) { ord = cmp(x._3, y._3); if (ord !== EQ) return ord;
		if (n >= 5) { ord = cmp(x._4, y._4); if (ord !== EQ) return ord;
		if (n >= 6) { ord = cmp(x._5, y._5); if (ord !== EQ) return ord;
		if (n >= 7) throw new Error('Comparison error: ' + err); } } } } } }
		return EQ;
	}

	throw new Error(
		'Comparison error: comparison is only defined on ints, '
		+ 'floats, times, chars, strings, lists of comparable values, '
		+ 'and tuples of comparable values.'
	);
}


// COMMON VALUES

var Tuple0 = {
	ctor: '_Tuple0'
};

function Tuple2(x, y)
{
	return {
		ctor: '_Tuple2',
		_0: x,
		_1: y
	};
}

function chr(c)
{
	return new String(c);
}


// GUID

var count = 0;
function guid(_)
{
	return count++;
}


// RECORDS

function update(oldRecord, updatedFields)
{
	var newRecord = {};

	for (var key in oldRecord)
	{
		newRecord[key] = oldRecord[key];
	}

	for (var key in updatedFields)
	{
		newRecord[key] = updatedFields[key];
	}

	return newRecord;
}


//// LIST STUFF ////

var Nil = { ctor: '[]' };

function Cons(hd, tl)
{
	return {
		ctor: '::',
		_0: hd,
		_1: tl
	};
}

function append(xs, ys)
{
	// append Strings
	if (typeof xs === 'string')
	{
		return xs + ys;
	}

	// append Lists
	if (xs.ctor === '[]')
	{
		return ys;
	}
	var root = Cons(xs._0, Nil);
	var curr = root;
	xs = xs._1;
	while (xs.ctor !== '[]')
	{
		curr._1 = Cons(xs._0, Nil);
		xs = xs._1;
		curr = curr._1;
	}
	curr._1 = ys;
	return root;
}


// CRASHES

function crash(moduleName, region)
{
	return function(message) {
		throw new Error(
			'Ran into a `Debug.crash` in module `' + moduleName + '` ' + regionToString(region) + '\n'
			+ 'The message provided by the code author is:\n\n    '
			+ message
		);
	};
}

function crashCase(moduleName, region, value)
{
	return function(message) {
		throw new Error(
			'Ran into a `Debug.crash` in module `' + moduleName + '`\n\n'
			+ 'This was caused by the `case` expression ' + regionToString(region) + '.\n'
			+ 'One of the branches ended with a crash and the following value got through:\n\n    ' + toString(value) + '\n\n'
			+ 'The message provided by the code author is:\n\n    '
			+ message
		);
	};
}

function regionToString(region)
{
	if (region.start.line == region.end.line)
	{
		return 'on line ' + region.start.line;
	}
	return 'between lines ' + region.start.line + ' and ' + region.end.line;
}


// TO STRING

function toString(v)
{
	var type = typeof v;
	if (type === 'function')
	{
		return '<function>';
	}

	if (type === 'boolean')
	{
		return v ? 'True' : 'False';
	}

	if (type === 'number')
	{
		return v + '';
	}

	if (v instanceof String)
	{
		return '\'' + addSlashes(v, true) + '\'';
	}

	if (type === 'string')
	{
		return '"' + addSlashes(v, false) + '"';
	}

	if (v === null)
	{
		return 'null';
	}

	if (type === 'object' && 'ctor' in v)
	{
		var ctorStarter = v.ctor.substring(0, 5);

		if (ctorStarter === '_Tupl')
		{
			var output = [];
			for (var k in v)
			{
				if (k === 'ctor') continue;
				output.push(toString(v[k]));
			}
			return '(' + output.join(',') + ')';
		}

		if (ctorStarter === '_Task')
		{
			return '<task>'
		}

		if (v.ctor === '_Array')
		{
			var list = _elm_lang$core$Array$toList(v);
			return 'Array.fromList ' + toString(list);
		}

		if (v.ctor === '<decoder>')
		{
			return '<decoder>';
		}

		if (v.ctor === '_Process')
		{
			return '<process:' + v.id + '>';
		}

		if (v.ctor === '::')
		{
			var output = '[' + toString(v._0);
			v = v._1;
			while (v.ctor === '::')
			{
				output += ',' + toString(v._0);
				v = v._1;
			}
			return output + ']';
		}

		if (v.ctor === '[]')
		{
			return '[]';
		}

		if (v.ctor === 'Set_elm_builtin')
		{
			return 'Set.fromList ' + toString(_elm_lang$core$Set$toList(v));
		}

		if (v.ctor === 'RBNode_elm_builtin' || v.ctor === 'RBEmpty_elm_builtin')
		{
			return 'Dict.fromList ' + toString(_elm_lang$core$Dict$toList(v));
		}

		var output = '';
		for (var i in v)
		{
			if (i === 'ctor') continue;
			var str = toString(v[i]);
			var c0 = str[0];
			var parenless = c0 === '{' || c0 === '(' || c0 === '<' || c0 === '"' || str.indexOf(' ') < 0;
			output += ' ' + (parenless ? str : '(' + str + ')');
		}
		return v.ctor + output;
	}

	if (type === 'object')
	{
		if (v instanceof Date)
		{
			return '<' + v.toString() + '>';
		}

		if (v.elm_web_socket)
		{
			return '<websocket>';
		}

		var output = [];
		for (var k in v)
		{
			output.push(k + ' = ' + toString(v[k]));
		}
		if (output.length === 0)
		{
			return '{}';
		}
		return '{ ' + output.join(', ') + ' }';
	}

	return '<internal structure>';
}

function addSlashes(str, isChar)
{
	var s = str.replace(/\\/g, '\\\\')
			  .replace(/\n/g, '\\n')
			  .replace(/\t/g, '\\t')
			  .replace(/\r/g, '\\r')
			  .replace(/\v/g, '\\v')
			  .replace(/\0/g, '\\0');
	if (isChar)
	{
		return s.replace(/\'/g, '\\\'');
	}
	else
	{
		return s.replace(/\"/g, '\\"');
	}
}


return {
	eq: eq,
	cmp: cmp,
	Tuple0: Tuple0,
	Tuple2: Tuple2,
	chr: chr,
	update: update,
	guid: guid,

	append: F2(append),

	crash: crash,
	crashCase: crashCase,

	toString: toString
};

}();
var _elm_lang$core$Basics$never = function (_p0) {
	never:
	while (true) {
		var _p1 = _p0;
		var _v1 = _p1._0;
		_p0 = _v1;
		continue never;
	}
};
var _elm_lang$core$Basics$uncurry = F2(
	function (f, _p2) {
		var _p3 = _p2;
		return A2(f, _p3._0, _p3._1);
	});
var _elm_lang$core$Basics$curry = F3(
	function (f, a, b) {
		return f(
			{ctor: '_Tuple2', _0: a, _1: b});
	});
var _elm_lang$core$Basics$flip = F3(
	function (f, b, a) {
		return A2(f, a, b);
	});
var _elm_lang$core$Basics$always = F2(
	function (a, _p4) {
		return a;
	});
var _elm_lang$core$Basics$identity = function (x) {
	return x;
};
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['<|'] = F2(
	function (f, x) {
		return f(x);
	});
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['|>'] = F2(
	function (x, f) {
		return f(x);
	});
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['>>'] = F3(
	function (f, g, x) {
		return g(
			f(x));
	});
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['<<'] = F3(
	function (g, f, x) {
		return g(
			f(x));
	});
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['++'] = _elm_lang$core$Native_Utils.append;
var _elm_lang$core$Basics$toString = _elm_lang$core$Native_Utils.toString;
var _elm_lang$core$Basics$isInfinite = _elm_lang$core$Native_Basics.isInfinite;
var _elm_lang$core$Basics$isNaN = _elm_lang$core$Native_Basics.isNaN;
var _elm_lang$core$Basics$toFloat = _elm_lang$core$Native_Basics.toFloat;
var _elm_lang$core$Basics$ceiling = _elm_lang$core$Native_Basics.ceiling;
var _elm_lang$core$Basics$floor = _elm_lang$core$Native_Basics.floor;
var _elm_lang$core$Basics$truncate = _elm_lang$core$Native_Basics.truncate;
var _elm_lang$core$Basics$round = _elm_lang$core$Native_Basics.round;
var _elm_lang$core$Basics$not = _elm_lang$core$Native_Basics.not;
var _elm_lang$core$Basics$xor = _elm_lang$core$Native_Basics.xor;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['||'] = _elm_lang$core$Native_Basics.or;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['&&'] = _elm_lang$core$Native_Basics.and;
var _elm_lang$core$Basics$max = _elm_lang$core$Native_Basics.max;
var _elm_lang$core$Basics$min = _elm_lang$core$Native_Basics.min;
var _elm_lang$core$Basics$compare = _elm_lang$core$Native_Basics.compare;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['>='] = _elm_lang$core$Native_Basics.ge;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['<='] = _elm_lang$core$Native_Basics.le;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['>'] = _elm_lang$core$Native_Basics.gt;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['<'] = _elm_lang$core$Native_Basics.lt;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['/='] = _elm_lang$core$Native_Basics.neq;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['=='] = _elm_lang$core$Native_Basics.eq;
var _elm_lang$core$Basics$e = _elm_lang$core$Native_Basics.e;
var _elm_lang$core$Basics$pi = _elm_lang$core$Native_Basics.pi;
var _elm_lang$core$Basics$clamp = _elm_lang$core$Native_Basics.clamp;
var _elm_lang$core$Basics$logBase = _elm_lang$core$Native_Basics.logBase;
var _elm_lang$core$Basics$abs = _elm_lang$core$Native_Basics.abs;
var _elm_lang$core$Basics$negate = _elm_lang$core$Native_Basics.negate;
var _elm_lang$core$Basics$sqrt = _elm_lang$core$Native_Basics.sqrt;
var _elm_lang$core$Basics$atan2 = _elm_lang$core$Native_Basics.atan2;
var _elm_lang$core$Basics$atan = _elm_lang$core$Native_Basics.atan;
var _elm_lang$core$Basics$asin = _elm_lang$core$Native_Basics.asin;
var _elm_lang$core$Basics$acos = _elm_lang$core$Native_Basics.acos;
var _elm_lang$core$Basics$tan = _elm_lang$core$Native_Basics.tan;
var _elm_lang$core$Basics$sin = _elm_lang$core$Native_Basics.sin;
var _elm_lang$core$Basics$cos = _elm_lang$core$Native_Basics.cos;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['^'] = _elm_lang$core$Native_Basics.exp;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['%'] = _elm_lang$core$Native_Basics.mod;
var _elm_lang$core$Basics$rem = _elm_lang$core$Native_Basics.rem;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['//'] = _elm_lang$core$Native_Basics.div;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['/'] = _elm_lang$core$Native_Basics.floatDiv;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['*'] = _elm_lang$core$Native_Basics.mul;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['-'] = _elm_lang$core$Native_Basics.sub;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['+'] = _elm_lang$core$Native_Basics.add;
var _elm_lang$core$Basics$toPolar = _elm_lang$core$Native_Basics.toPolar;
var _elm_lang$core$Basics$fromPolar = _elm_lang$core$Native_Basics.fromPolar;
var _elm_lang$core$Basics$turns = _elm_lang$core$Native_Basics.turns;
var _elm_lang$core$Basics$degrees = _elm_lang$core$Native_Basics.degrees;
var _elm_lang$core$Basics$radians = function (t) {
	return t;
};
var _elm_lang$core$Basics$GT = {ctor: 'GT'};
var _elm_lang$core$Basics$EQ = {ctor: 'EQ'};
var _elm_lang$core$Basics$LT = {ctor: 'LT'};
var _elm_lang$core$Basics$JustOneMore = function (a) {
	return {ctor: 'JustOneMore', _0: a};
};

var _elm_lang$core$Maybe$withDefault = F2(
	function ($default, maybe) {
		var _p0 = maybe;
		if (_p0.ctor === 'Just') {
			return _p0._0;
		} else {
			return $default;
		}
	});
var _elm_lang$core$Maybe$Nothing = {ctor: 'Nothing'};
var _elm_lang$core$Maybe$andThen = F2(
	function (callback, maybeValue) {
		var _p1 = maybeValue;
		if (_p1.ctor === 'Just') {
			return callback(_p1._0);
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});
var _elm_lang$core$Maybe$Just = function (a) {
	return {ctor: 'Just', _0: a};
};
var _elm_lang$core$Maybe$map = F2(
	function (f, maybe) {
		var _p2 = maybe;
		if (_p2.ctor === 'Just') {
			return _elm_lang$core$Maybe$Just(
				f(_p2._0));
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});
var _elm_lang$core$Maybe$map2 = F3(
	function (func, ma, mb) {
		var _p3 = {ctor: '_Tuple2', _0: ma, _1: mb};
		if (((_p3.ctor === '_Tuple2') && (_p3._0.ctor === 'Just')) && (_p3._1.ctor === 'Just')) {
			return _elm_lang$core$Maybe$Just(
				A2(func, _p3._0._0, _p3._1._0));
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});
var _elm_lang$core$Maybe$map3 = F4(
	function (func, ma, mb, mc) {
		var _p4 = {ctor: '_Tuple3', _0: ma, _1: mb, _2: mc};
		if ((((_p4.ctor === '_Tuple3') && (_p4._0.ctor === 'Just')) && (_p4._1.ctor === 'Just')) && (_p4._2.ctor === 'Just')) {
			return _elm_lang$core$Maybe$Just(
				A3(func, _p4._0._0, _p4._1._0, _p4._2._0));
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});
var _elm_lang$core$Maybe$map4 = F5(
	function (func, ma, mb, mc, md) {
		var _p5 = {ctor: '_Tuple4', _0: ma, _1: mb, _2: mc, _3: md};
		if (((((_p5.ctor === '_Tuple4') && (_p5._0.ctor === 'Just')) && (_p5._1.ctor === 'Just')) && (_p5._2.ctor === 'Just')) && (_p5._3.ctor === 'Just')) {
			return _elm_lang$core$Maybe$Just(
				A4(func, _p5._0._0, _p5._1._0, _p5._2._0, _p5._3._0));
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});
var _elm_lang$core$Maybe$map5 = F6(
	function (func, ma, mb, mc, md, me) {
		var _p6 = {ctor: '_Tuple5', _0: ma, _1: mb, _2: mc, _3: md, _4: me};
		if ((((((_p6.ctor === '_Tuple5') && (_p6._0.ctor === 'Just')) && (_p6._1.ctor === 'Just')) && (_p6._2.ctor === 'Just')) && (_p6._3.ctor === 'Just')) && (_p6._4.ctor === 'Just')) {
			return _elm_lang$core$Maybe$Just(
				A5(func, _p6._0._0, _p6._1._0, _p6._2._0, _p6._3._0, _p6._4._0));
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});

//import Native.Utils //

var _elm_lang$core$Native_List = function() {

var Nil = { ctor: '[]' };

function Cons(hd, tl)
{
	return { ctor: '::', _0: hd, _1: tl };
}

function fromArray(arr)
{
	var out = Nil;
	for (var i = arr.length; i--; )
	{
		out = Cons(arr[i], out);
	}
	return out;
}

function toArray(xs)
{
	var out = [];
	while (xs.ctor !== '[]')
	{
		out.push(xs._0);
		xs = xs._1;
	}
	return out;
}

function foldr(f, b, xs)
{
	var arr = toArray(xs);
	var acc = b;
	for (var i = arr.length; i--; )
	{
		acc = A2(f, arr[i], acc);
	}
	return acc;
}

function map2(f, xs, ys)
{
	var arr = [];
	while (xs.ctor !== '[]' && ys.ctor !== '[]')
	{
		arr.push(A2(f, xs._0, ys._0));
		xs = xs._1;
		ys = ys._1;
	}
	return fromArray(arr);
}

function map3(f, xs, ys, zs)
{
	var arr = [];
	while (xs.ctor !== '[]' && ys.ctor !== '[]' && zs.ctor !== '[]')
	{
		arr.push(A3(f, xs._0, ys._0, zs._0));
		xs = xs._1;
		ys = ys._1;
		zs = zs._1;
	}
	return fromArray(arr);
}

function map4(f, ws, xs, ys, zs)
{
	var arr = [];
	while (   ws.ctor !== '[]'
		   && xs.ctor !== '[]'
		   && ys.ctor !== '[]'
		   && zs.ctor !== '[]')
	{
		arr.push(A4(f, ws._0, xs._0, ys._0, zs._0));
		ws = ws._1;
		xs = xs._1;
		ys = ys._1;
		zs = zs._1;
	}
	return fromArray(arr);
}

function map5(f, vs, ws, xs, ys, zs)
{
	var arr = [];
	while (   vs.ctor !== '[]'
		   && ws.ctor !== '[]'
		   && xs.ctor !== '[]'
		   && ys.ctor !== '[]'
		   && zs.ctor !== '[]')
	{
		arr.push(A5(f, vs._0, ws._0, xs._0, ys._0, zs._0));
		vs = vs._1;
		ws = ws._1;
		xs = xs._1;
		ys = ys._1;
		zs = zs._1;
	}
	return fromArray(arr);
}

function sortBy(f, xs)
{
	return fromArray(toArray(xs).sort(function(a, b) {
		return _elm_lang$core$Native_Utils.cmp(f(a), f(b));
	}));
}

function sortWith(f, xs)
{
	return fromArray(toArray(xs).sort(function(a, b) {
		var ord = f(a)(b).ctor;
		return ord === 'EQ' ? 0 : ord === 'LT' ? -1 : 1;
	}));
}

return {
	Nil: Nil,
	Cons: Cons,
	cons: F2(Cons),
	toArray: toArray,
	fromArray: fromArray,

	foldr: F3(foldr),

	map2: F3(map2),
	map3: F4(map3),
	map4: F5(map4),
	map5: F6(map5),
	sortBy: F2(sortBy),
	sortWith: F2(sortWith)
};

}();
var _elm_lang$core$List$sortWith = _elm_lang$core$Native_List.sortWith;
var _elm_lang$core$List$sortBy = _elm_lang$core$Native_List.sortBy;
var _elm_lang$core$List$sort = function (xs) {
	return A2(_elm_lang$core$List$sortBy, _elm_lang$core$Basics$identity, xs);
};
var _elm_lang$core$List$singleton = function (value) {
	return {
		ctor: '::',
		_0: value,
		_1: {ctor: '[]'}
	};
};
var _elm_lang$core$List$drop = F2(
	function (n, list) {
		drop:
		while (true) {
			if (_elm_lang$core$Native_Utils.cmp(n, 0) < 1) {
				return list;
			} else {
				var _p0 = list;
				if (_p0.ctor === '[]') {
					return list;
				} else {
					var _v1 = n - 1,
						_v2 = _p0._1;
					n = _v1;
					list = _v2;
					continue drop;
				}
			}
		}
	});
var _elm_lang$core$List$map5 = _elm_lang$core$Native_List.map5;
var _elm_lang$core$List$map4 = _elm_lang$core$Native_List.map4;
var _elm_lang$core$List$map3 = _elm_lang$core$Native_List.map3;
var _elm_lang$core$List$map2 = _elm_lang$core$Native_List.map2;
var _elm_lang$core$List$any = F2(
	function (isOkay, list) {
		any:
		while (true) {
			var _p1 = list;
			if (_p1.ctor === '[]') {
				return false;
			} else {
				if (isOkay(_p1._0)) {
					return true;
				} else {
					var _v4 = isOkay,
						_v5 = _p1._1;
					isOkay = _v4;
					list = _v5;
					continue any;
				}
			}
		}
	});
var _elm_lang$core$List$all = F2(
	function (isOkay, list) {
		return !A2(
			_elm_lang$core$List$any,
			function (_p2) {
				return !isOkay(_p2);
			},
			list);
	});
var _elm_lang$core$List$foldr = _elm_lang$core$Native_List.foldr;
var _elm_lang$core$List$foldl = F3(
	function (func, acc, list) {
		foldl:
		while (true) {
			var _p3 = list;
			if (_p3.ctor === '[]') {
				return acc;
			} else {
				var _v7 = func,
					_v8 = A2(func, _p3._0, acc),
					_v9 = _p3._1;
				func = _v7;
				acc = _v8;
				list = _v9;
				continue foldl;
			}
		}
	});
var _elm_lang$core$List$length = function (xs) {
	return A3(
		_elm_lang$core$List$foldl,
		F2(
			function (_p4, i) {
				return i + 1;
			}),
		0,
		xs);
};
var _elm_lang$core$List$sum = function (numbers) {
	return A3(
		_elm_lang$core$List$foldl,
		F2(
			function (x, y) {
				return x + y;
			}),
		0,
		numbers);
};
var _elm_lang$core$List$product = function (numbers) {
	return A3(
		_elm_lang$core$List$foldl,
		F2(
			function (x, y) {
				return x * y;
			}),
		1,
		numbers);
};
var _elm_lang$core$List$maximum = function (list) {
	var _p5 = list;
	if (_p5.ctor === '::') {
		return _elm_lang$core$Maybe$Just(
			A3(_elm_lang$core$List$foldl, _elm_lang$core$Basics$max, _p5._0, _p5._1));
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _elm_lang$core$List$minimum = function (list) {
	var _p6 = list;
	if (_p6.ctor === '::') {
		return _elm_lang$core$Maybe$Just(
			A3(_elm_lang$core$List$foldl, _elm_lang$core$Basics$min, _p6._0, _p6._1));
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _elm_lang$core$List$member = F2(
	function (x, xs) {
		return A2(
			_elm_lang$core$List$any,
			function (a) {
				return _elm_lang$core$Native_Utils.eq(a, x);
			},
			xs);
	});
var _elm_lang$core$List$isEmpty = function (xs) {
	var _p7 = xs;
	if (_p7.ctor === '[]') {
		return true;
	} else {
		return false;
	}
};
var _elm_lang$core$List$tail = function (list) {
	var _p8 = list;
	if (_p8.ctor === '::') {
		return _elm_lang$core$Maybe$Just(_p8._1);
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _elm_lang$core$List$head = function (list) {
	var _p9 = list;
	if (_p9.ctor === '::') {
		return _elm_lang$core$Maybe$Just(_p9._0);
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _elm_lang$core$List_ops = _elm_lang$core$List_ops || {};
_elm_lang$core$List_ops['::'] = _elm_lang$core$Native_List.cons;
var _elm_lang$core$List$map = F2(
	function (f, xs) {
		return A3(
			_elm_lang$core$List$foldr,
			F2(
				function (x, acc) {
					return {
						ctor: '::',
						_0: f(x),
						_1: acc
					};
				}),
			{ctor: '[]'},
			xs);
	});
var _elm_lang$core$List$filter = F2(
	function (pred, xs) {
		var conditionalCons = F2(
			function (front, back) {
				return pred(front) ? {ctor: '::', _0: front, _1: back} : back;
			});
		return A3(
			_elm_lang$core$List$foldr,
			conditionalCons,
			{ctor: '[]'},
			xs);
	});
var _elm_lang$core$List$maybeCons = F3(
	function (f, mx, xs) {
		var _p10 = f(mx);
		if (_p10.ctor === 'Just') {
			return {ctor: '::', _0: _p10._0, _1: xs};
		} else {
			return xs;
		}
	});
var _elm_lang$core$List$filterMap = F2(
	function (f, xs) {
		return A3(
			_elm_lang$core$List$foldr,
			_elm_lang$core$List$maybeCons(f),
			{ctor: '[]'},
			xs);
	});
var _elm_lang$core$List$reverse = function (list) {
	return A3(
		_elm_lang$core$List$foldl,
		F2(
			function (x, y) {
				return {ctor: '::', _0: x, _1: y};
			}),
		{ctor: '[]'},
		list);
};
var _elm_lang$core$List$scanl = F3(
	function (f, b, xs) {
		var scan1 = F2(
			function (x, accAcc) {
				var _p11 = accAcc;
				if (_p11.ctor === '::') {
					return {
						ctor: '::',
						_0: A2(f, x, _p11._0),
						_1: accAcc
					};
				} else {
					return {ctor: '[]'};
				}
			});
		return _elm_lang$core$List$reverse(
			A3(
				_elm_lang$core$List$foldl,
				scan1,
				{
					ctor: '::',
					_0: b,
					_1: {ctor: '[]'}
				},
				xs));
	});
var _elm_lang$core$List$append = F2(
	function (xs, ys) {
		var _p12 = ys;
		if (_p12.ctor === '[]') {
			return xs;
		} else {
			return A3(
				_elm_lang$core$List$foldr,
				F2(
					function (x, y) {
						return {ctor: '::', _0: x, _1: y};
					}),
				ys,
				xs);
		}
	});
var _elm_lang$core$List$concat = function (lists) {
	return A3(
		_elm_lang$core$List$foldr,
		_elm_lang$core$List$append,
		{ctor: '[]'},
		lists);
};
var _elm_lang$core$List$concatMap = F2(
	function (f, list) {
		return _elm_lang$core$List$concat(
			A2(_elm_lang$core$List$map, f, list));
	});
var _elm_lang$core$List$partition = F2(
	function (pred, list) {
		var step = F2(
			function (x, _p13) {
				var _p14 = _p13;
				var _p16 = _p14._0;
				var _p15 = _p14._1;
				return pred(x) ? {
					ctor: '_Tuple2',
					_0: {ctor: '::', _0: x, _1: _p16},
					_1: _p15
				} : {
					ctor: '_Tuple2',
					_0: _p16,
					_1: {ctor: '::', _0: x, _1: _p15}
				};
			});
		return A3(
			_elm_lang$core$List$foldr,
			step,
			{
				ctor: '_Tuple2',
				_0: {ctor: '[]'},
				_1: {ctor: '[]'}
			},
			list);
	});
var _elm_lang$core$List$unzip = function (pairs) {
	var step = F2(
		function (_p18, _p17) {
			var _p19 = _p18;
			var _p20 = _p17;
			return {
				ctor: '_Tuple2',
				_0: {ctor: '::', _0: _p19._0, _1: _p20._0},
				_1: {ctor: '::', _0: _p19._1, _1: _p20._1}
			};
		});
	return A3(
		_elm_lang$core$List$foldr,
		step,
		{
			ctor: '_Tuple2',
			_0: {ctor: '[]'},
			_1: {ctor: '[]'}
		},
		pairs);
};
var _elm_lang$core$List$intersperse = F2(
	function (sep, xs) {
		var _p21 = xs;
		if (_p21.ctor === '[]') {
			return {ctor: '[]'};
		} else {
			var step = F2(
				function (x, rest) {
					return {
						ctor: '::',
						_0: sep,
						_1: {ctor: '::', _0: x, _1: rest}
					};
				});
			var spersed = A3(
				_elm_lang$core$List$foldr,
				step,
				{ctor: '[]'},
				_p21._1);
			return {ctor: '::', _0: _p21._0, _1: spersed};
		}
	});
var _elm_lang$core$List$takeReverse = F3(
	function (n, list, taken) {
		takeReverse:
		while (true) {
			if (_elm_lang$core$Native_Utils.cmp(n, 0) < 1) {
				return taken;
			} else {
				var _p22 = list;
				if (_p22.ctor === '[]') {
					return taken;
				} else {
					var _v23 = n - 1,
						_v24 = _p22._1,
						_v25 = {ctor: '::', _0: _p22._0, _1: taken};
					n = _v23;
					list = _v24;
					taken = _v25;
					continue takeReverse;
				}
			}
		}
	});
var _elm_lang$core$List$takeTailRec = F2(
	function (n, list) {
		return _elm_lang$core$List$reverse(
			A3(
				_elm_lang$core$List$takeReverse,
				n,
				list,
				{ctor: '[]'}));
	});
var _elm_lang$core$List$takeFast = F3(
	function (ctr, n, list) {
		if (_elm_lang$core$Native_Utils.cmp(n, 0) < 1) {
			return {ctor: '[]'};
		} else {
			var _p23 = {ctor: '_Tuple2', _0: n, _1: list};
			_v26_5:
			do {
				_v26_1:
				do {
					if (_p23.ctor === '_Tuple2') {
						if (_p23._1.ctor === '[]') {
							return list;
						} else {
							if (_p23._1._1.ctor === '::') {
								switch (_p23._0) {
									case 1:
										break _v26_1;
									case 2:
										return {
											ctor: '::',
											_0: _p23._1._0,
											_1: {
												ctor: '::',
												_0: _p23._1._1._0,
												_1: {ctor: '[]'}
											}
										};
									case 3:
										if (_p23._1._1._1.ctor === '::') {
											return {
												ctor: '::',
												_0: _p23._1._0,
												_1: {
													ctor: '::',
													_0: _p23._1._1._0,
													_1: {
														ctor: '::',
														_0: _p23._1._1._1._0,
														_1: {ctor: '[]'}
													}
												}
											};
										} else {
											break _v26_5;
										}
									default:
										if ((_p23._1._1._1.ctor === '::') && (_p23._1._1._1._1.ctor === '::')) {
											var _p28 = _p23._1._1._1._0;
											var _p27 = _p23._1._1._0;
											var _p26 = _p23._1._0;
											var _p25 = _p23._1._1._1._1._0;
											var _p24 = _p23._1._1._1._1._1;
											return (_elm_lang$core$Native_Utils.cmp(ctr, 1000) > 0) ? {
												ctor: '::',
												_0: _p26,
												_1: {
													ctor: '::',
													_0: _p27,
													_1: {
														ctor: '::',
														_0: _p28,
														_1: {
															ctor: '::',
															_0: _p25,
															_1: A2(_elm_lang$core$List$takeTailRec, n - 4, _p24)
														}
													}
												}
											} : {
												ctor: '::',
												_0: _p26,
												_1: {
													ctor: '::',
													_0: _p27,
													_1: {
														ctor: '::',
														_0: _p28,
														_1: {
															ctor: '::',
															_0: _p25,
															_1: A3(_elm_lang$core$List$takeFast, ctr + 1, n - 4, _p24)
														}
													}
												}
											};
										} else {
											break _v26_5;
										}
								}
							} else {
								if (_p23._0 === 1) {
									break _v26_1;
								} else {
									break _v26_5;
								}
							}
						}
					} else {
						break _v26_5;
					}
				} while(false);
				return {
					ctor: '::',
					_0: _p23._1._0,
					_1: {ctor: '[]'}
				};
			} while(false);
			return list;
		}
	});
var _elm_lang$core$List$take = F2(
	function (n, list) {
		return A3(_elm_lang$core$List$takeFast, 0, n, list);
	});
var _elm_lang$core$List$repeatHelp = F3(
	function (result, n, value) {
		repeatHelp:
		while (true) {
			if (_elm_lang$core$Native_Utils.cmp(n, 0) < 1) {
				return result;
			} else {
				var _v27 = {ctor: '::', _0: value, _1: result},
					_v28 = n - 1,
					_v29 = value;
				result = _v27;
				n = _v28;
				value = _v29;
				continue repeatHelp;
			}
		}
	});
var _elm_lang$core$List$repeat = F2(
	function (n, value) {
		return A3(
			_elm_lang$core$List$repeatHelp,
			{ctor: '[]'},
			n,
			value);
	});
var _elm_lang$core$List$rangeHelp = F3(
	function (lo, hi, list) {
		rangeHelp:
		while (true) {
			if (_elm_lang$core$Native_Utils.cmp(lo, hi) < 1) {
				var _v30 = lo,
					_v31 = hi - 1,
					_v32 = {ctor: '::', _0: hi, _1: list};
				lo = _v30;
				hi = _v31;
				list = _v32;
				continue rangeHelp;
			} else {
				return list;
			}
		}
	});
var _elm_lang$core$List$range = F2(
	function (lo, hi) {
		return A3(
			_elm_lang$core$List$rangeHelp,
			lo,
			hi,
			{ctor: '[]'});
	});
var _elm_lang$core$List$indexedMap = F2(
	function (f, xs) {
		return A3(
			_elm_lang$core$List$map2,
			f,
			A2(
				_elm_lang$core$List$range,
				0,
				_elm_lang$core$List$length(xs) - 1),
			xs);
	});

var _elm_lang$core$Array$append = _elm_lang$core$Native_Array.append;
var _elm_lang$core$Array$length = _elm_lang$core$Native_Array.length;
var _elm_lang$core$Array$isEmpty = function (array) {
	return _elm_lang$core$Native_Utils.eq(
		_elm_lang$core$Array$length(array),
		0);
};
var _elm_lang$core$Array$slice = _elm_lang$core$Native_Array.slice;
var _elm_lang$core$Array$set = _elm_lang$core$Native_Array.set;
var _elm_lang$core$Array$get = F2(
	function (i, array) {
		return ((_elm_lang$core$Native_Utils.cmp(0, i) < 1) && (_elm_lang$core$Native_Utils.cmp(
			i,
			_elm_lang$core$Native_Array.length(array)) < 0)) ? _elm_lang$core$Maybe$Just(
			A2(_elm_lang$core$Native_Array.get, i, array)) : _elm_lang$core$Maybe$Nothing;
	});
var _elm_lang$core$Array$push = _elm_lang$core$Native_Array.push;
var _elm_lang$core$Array$empty = _elm_lang$core$Native_Array.empty;
var _elm_lang$core$Array$filter = F2(
	function (isOkay, arr) {
		var update = F2(
			function (x, xs) {
				return isOkay(x) ? A2(_elm_lang$core$Native_Array.push, x, xs) : xs;
			});
		return A3(_elm_lang$core$Native_Array.foldl, update, _elm_lang$core$Native_Array.empty, arr);
	});
var _elm_lang$core$Array$foldr = _elm_lang$core$Native_Array.foldr;
var _elm_lang$core$Array$foldl = _elm_lang$core$Native_Array.foldl;
var _elm_lang$core$Array$indexedMap = _elm_lang$core$Native_Array.indexedMap;
var _elm_lang$core$Array$map = _elm_lang$core$Native_Array.map;
var _elm_lang$core$Array$toIndexedList = function (array) {
	return A3(
		_elm_lang$core$List$map2,
		F2(
			function (v0, v1) {
				return {ctor: '_Tuple2', _0: v0, _1: v1};
			}),
		A2(
			_elm_lang$core$List$range,
			0,
			_elm_lang$core$Native_Array.length(array) - 1),
		_elm_lang$core$Native_Array.toList(array));
};
var _elm_lang$core$Array$toList = _elm_lang$core$Native_Array.toList;
var _elm_lang$core$Array$fromList = _elm_lang$core$Native_Array.fromList;
var _elm_lang$core$Array$initialize = _elm_lang$core$Native_Array.initialize;
var _elm_lang$core$Array$repeat = F2(
	function (n, e) {
		return A2(
			_elm_lang$core$Array$initialize,
			n,
			_elm_lang$core$Basics$always(e));
	});
var _elm_lang$core$Array$Array = {ctor: 'Array'};

//import Native.Utils //

var _elm_lang$core$Native_Debug = function() {

function log(tag, value)
{
	var msg = tag + ': ' + _elm_lang$core$Native_Utils.toString(value);
	var process = process || {};
	if (process.stdout)
	{
		process.stdout.write(msg);
	}
	else
	{
		console.log(msg);
	}
	return value;
}

function crash(message)
{
	throw new Error(message);
}

return {
	crash: crash,
	log: F2(log)
};

}();
var _elm_lang$core$Debug$crash = _elm_lang$core$Native_Debug.crash;
var _elm_lang$core$Debug$log = _elm_lang$core$Native_Debug.log;

var _elm_lang$core$Result$toMaybe = function (result) {
	var _p0 = result;
	if (_p0.ctor === 'Ok') {
		return _elm_lang$core$Maybe$Just(_p0._0);
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _elm_lang$core$Result$withDefault = F2(
	function (def, result) {
		var _p1 = result;
		if (_p1.ctor === 'Ok') {
			return _p1._0;
		} else {
			return def;
		}
	});
var _elm_lang$core$Result$Err = function (a) {
	return {ctor: 'Err', _0: a};
};
var _elm_lang$core$Result$andThen = F2(
	function (callback, result) {
		var _p2 = result;
		if (_p2.ctor === 'Ok') {
			return callback(_p2._0);
		} else {
			return _elm_lang$core$Result$Err(_p2._0);
		}
	});
var _elm_lang$core$Result$Ok = function (a) {
	return {ctor: 'Ok', _0: a};
};
var _elm_lang$core$Result$map = F2(
	function (func, ra) {
		var _p3 = ra;
		if (_p3.ctor === 'Ok') {
			return _elm_lang$core$Result$Ok(
				func(_p3._0));
		} else {
			return _elm_lang$core$Result$Err(_p3._0);
		}
	});
var _elm_lang$core$Result$map2 = F3(
	function (func, ra, rb) {
		var _p4 = {ctor: '_Tuple2', _0: ra, _1: rb};
		if (_p4._0.ctor === 'Ok') {
			if (_p4._1.ctor === 'Ok') {
				return _elm_lang$core$Result$Ok(
					A2(func, _p4._0._0, _p4._1._0));
			} else {
				return _elm_lang$core$Result$Err(_p4._1._0);
			}
		} else {
			return _elm_lang$core$Result$Err(_p4._0._0);
		}
	});
var _elm_lang$core$Result$map3 = F4(
	function (func, ra, rb, rc) {
		var _p5 = {ctor: '_Tuple3', _0: ra, _1: rb, _2: rc};
		if (_p5._0.ctor === 'Ok') {
			if (_p5._1.ctor === 'Ok') {
				if (_p5._2.ctor === 'Ok') {
					return _elm_lang$core$Result$Ok(
						A3(func, _p5._0._0, _p5._1._0, _p5._2._0));
				} else {
					return _elm_lang$core$Result$Err(_p5._2._0);
				}
			} else {
				return _elm_lang$core$Result$Err(_p5._1._0);
			}
		} else {
			return _elm_lang$core$Result$Err(_p5._0._0);
		}
	});
var _elm_lang$core$Result$map4 = F5(
	function (func, ra, rb, rc, rd) {
		var _p6 = {ctor: '_Tuple4', _0: ra, _1: rb, _2: rc, _3: rd};
		if (_p6._0.ctor === 'Ok') {
			if (_p6._1.ctor === 'Ok') {
				if (_p6._2.ctor === 'Ok') {
					if (_p6._3.ctor === 'Ok') {
						return _elm_lang$core$Result$Ok(
							A4(func, _p6._0._0, _p6._1._0, _p6._2._0, _p6._3._0));
					} else {
						return _elm_lang$core$Result$Err(_p6._3._0);
					}
				} else {
					return _elm_lang$core$Result$Err(_p6._2._0);
				}
			} else {
				return _elm_lang$core$Result$Err(_p6._1._0);
			}
		} else {
			return _elm_lang$core$Result$Err(_p6._0._0);
		}
	});
var _elm_lang$core$Result$map5 = F6(
	function (func, ra, rb, rc, rd, re) {
		var _p7 = {ctor: '_Tuple5', _0: ra, _1: rb, _2: rc, _3: rd, _4: re};
		if (_p7._0.ctor === 'Ok') {
			if (_p7._1.ctor === 'Ok') {
				if (_p7._2.ctor === 'Ok') {
					if (_p7._3.ctor === 'Ok') {
						if (_p7._4.ctor === 'Ok') {
							return _elm_lang$core$Result$Ok(
								A5(func, _p7._0._0, _p7._1._0, _p7._2._0, _p7._3._0, _p7._4._0));
						} else {
							return _elm_lang$core$Result$Err(_p7._4._0);
						}
					} else {
						return _elm_lang$core$Result$Err(_p7._3._0);
					}
				} else {
					return _elm_lang$core$Result$Err(_p7._2._0);
				}
			} else {
				return _elm_lang$core$Result$Err(_p7._1._0);
			}
		} else {
			return _elm_lang$core$Result$Err(_p7._0._0);
		}
	});
var _elm_lang$core$Result$mapError = F2(
	function (f, result) {
		var _p8 = result;
		if (_p8.ctor === 'Ok') {
			return _elm_lang$core$Result$Ok(_p8._0);
		} else {
			return _elm_lang$core$Result$Err(
				f(_p8._0));
		}
	});
var _elm_lang$core$Result$fromMaybe = F2(
	function (err, maybe) {
		var _p9 = maybe;
		if (_p9.ctor === 'Just') {
			return _elm_lang$core$Result$Ok(_p9._0);
		} else {
			return _elm_lang$core$Result$Err(err);
		}
	});

//import Maybe, Native.List, Native.Utils, Result //

var _elm_lang$core$Native_String = function() {

function isEmpty(str)
{
	return str.length === 0;
}
function cons(chr, str)
{
	return chr + str;
}
function uncons(str)
{
	var hd = str[0];
	if (hd)
	{
		return _elm_lang$core$Maybe$Just(_elm_lang$core$Native_Utils.Tuple2(_elm_lang$core$Native_Utils.chr(hd), str.slice(1)));
	}
	return _elm_lang$core$Maybe$Nothing;
}
function append(a, b)
{
	return a + b;
}
function concat(strs)
{
	return _elm_lang$core$Native_List.toArray(strs).join('');
}
function length(str)
{
	return str.length;
}
function map(f, str)
{
	var out = str.split('');
	for (var i = out.length; i--; )
	{
		out[i] = f(_elm_lang$core$Native_Utils.chr(out[i]));
	}
	return out.join('');
}
function filter(pred, str)
{
	return str.split('').map(_elm_lang$core$Native_Utils.chr).filter(pred).join('');
}
function reverse(str)
{
	return str.split('').reverse().join('');
}
function foldl(f, b, str)
{
	var len = str.length;
	for (var i = 0; i < len; ++i)
	{
		b = A2(f, _elm_lang$core$Native_Utils.chr(str[i]), b);
	}
	return b;
}
function foldr(f, b, str)
{
	for (var i = str.length; i--; )
	{
		b = A2(f, _elm_lang$core$Native_Utils.chr(str[i]), b);
	}
	return b;
}
function split(sep, str)
{
	return _elm_lang$core$Native_List.fromArray(str.split(sep));
}
function join(sep, strs)
{
	return _elm_lang$core$Native_List.toArray(strs).join(sep);
}
function repeat(n, str)
{
	var result = '';
	while (n > 0)
	{
		if (n & 1)
		{
			result += str;
		}
		n >>= 1, str += str;
	}
	return result;
}
function slice(start, end, str)
{
	return str.slice(start, end);
}
function left(n, str)
{
	return n < 1 ? '' : str.slice(0, n);
}
function right(n, str)
{
	return n < 1 ? '' : str.slice(-n);
}
function dropLeft(n, str)
{
	return n < 1 ? str : str.slice(n);
}
function dropRight(n, str)
{
	return n < 1 ? str : str.slice(0, -n);
}
function pad(n, chr, str)
{
	var half = (n - str.length) / 2;
	return repeat(Math.ceil(half), chr) + str + repeat(half | 0, chr);
}
function padRight(n, chr, str)
{
	return str + repeat(n - str.length, chr);
}
function padLeft(n, chr, str)
{
	return repeat(n - str.length, chr) + str;
}

function trim(str)
{
	return str.trim();
}
function trimLeft(str)
{
	return str.replace(/^\s+/, '');
}
function trimRight(str)
{
	return str.replace(/\s+$/, '');
}

function words(str)
{
	return _elm_lang$core$Native_List.fromArray(str.trim().split(/\s+/g));
}
function lines(str)
{
	return _elm_lang$core$Native_List.fromArray(str.split(/\r\n|\r|\n/g));
}

function toUpper(str)
{
	return str.toUpperCase();
}
function toLower(str)
{
	return str.toLowerCase();
}

function any(pred, str)
{
	for (var i = str.length; i--; )
	{
		if (pred(_elm_lang$core$Native_Utils.chr(str[i])))
		{
			return true;
		}
	}
	return false;
}
function all(pred, str)
{
	for (var i = str.length; i--; )
	{
		if (!pred(_elm_lang$core$Native_Utils.chr(str[i])))
		{
			return false;
		}
	}
	return true;
}

function contains(sub, str)
{
	return str.indexOf(sub) > -1;
}
function startsWith(sub, str)
{
	return str.indexOf(sub) === 0;
}
function endsWith(sub, str)
{
	return str.length >= sub.length &&
		str.lastIndexOf(sub) === str.length - sub.length;
}
function indexes(sub, str)
{
	var subLen = sub.length;

	if (subLen < 1)
	{
		return _elm_lang$core$Native_List.Nil;
	}

	var i = 0;
	var is = [];

	while ((i = str.indexOf(sub, i)) > -1)
	{
		is.push(i);
		i = i + subLen;
	}

	return _elm_lang$core$Native_List.fromArray(is);
}


function toInt(s)
{
	var len = s.length;

	// if empty
	if (len === 0)
	{
		return intErr(s);
	}

	// if hex
	var c = s[0];
	if (c === '0' && s[1] === 'x')
	{
		for (var i = 2; i < len; ++i)
		{
			var c = s[i];
			if (('0' <= c && c <= '9') || ('A' <= c && c <= 'F') || ('a' <= c && c <= 'f'))
			{
				continue;
			}
			return intErr(s);
		}
		return _elm_lang$core$Result$Ok(parseInt(s, 16));
	}

	// is decimal
	if (c > '9' || (c < '0' && c !== '-' && c !== '+'))
	{
		return intErr(s);
	}
	for (var i = 1; i < len; ++i)
	{
		var c = s[i];
		if (c < '0' || '9' < c)
		{
			return intErr(s);
		}
	}

	return _elm_lang$core$Result$Ok(parseInt(s, 10));
}

function intErr(s)
{
	return _elm_lang$core$Result$Err("could not convert string '" + s + "' to an Int");
}


function toFloat(s)
{
	// check if it is a hex, octal, or binary number
	if (s.length === 0 || /[\sxbo]/.test(s))
	{
		return floatErr(s);
	}
	var n = +s;
	// faster isNaN check
	return n === n ? _elm_lang$core$Result$Ok(n) : floatErr(s);
}

function floatErr(s)
{
	return _elm_lang$core$Result$Err("could not convert string '" + s + "' to a Float");
}


function toList(str)
{
	return _elm_lang$core$Native_List.fromArray(str.split('').map(_elm_lang$core$Native_Utils.chr));
}
function fromList(chars)
{
	return _elm_lang$core$Native_List.toArray(chars).join('');
}

return {
	isEmpty: isEmpty,
	cons: F2(cons),
	uncons: uncons,
	append: F2(append),
	concat: concat,
	length: length,
	map: F2(map),
	filter: F2(filter),
	reverse: reverse,
	foldl: F3(foldl),
	foldr: F3(foldr),

	split: F2(split),
	join: F2(join),
	repeat: F2(repeat),

	slice: F3(slice),
	left: F2(left),
	right: F2(right),
	dropLeft: F2(dropLeft),
	dropRight: F2(dropRight),

	pad: F3(pad),
	padLeft: F3(padLeft),
	padRight: F3(padRight),

	trim: trim,
	trimLeft: trimLeft,
	trimRight: trimRight,

	words: words,
	lines: lines,

	toUpper: toUpper,
	toLower: toLower,

	any: F2(any),
	all: F2(all),

	contains: F2(contains),
	startsWith: F2(startsWith),
	endsWith: F2(endsWith),
	indexes: F2(indexes),

	toInt: toInt,
	toFloat: toFloat,
	toList: toList,
	fromList: fromList
};

}();

//import Native.Utils //

var _elm_lang$core$Native_Char = function() {

return {
	fromCode: function(c) { return _elm_lang$core$Native_Utils.chr(String.fromCharCode(c)); },
	toCode: function(c) { return c.charCodeAt(0); },
	toUpper: function(c) { return _elm_lang$core$Native_Utils.chr(c.toUpperCase()); },
	toLower: function(c) { return _elm_lang$core$Native_Utils.chr(c.toLowerCase()); },
	toLocaleUpper: function(c) { return _elm_lang$core$Native_Utils.chr(c.toLocaleUpperCase()); },
	toLocaleLower: function(c) { return _elm_lang$core$Native_Utils.chr(c.toLocaleLowerCase()); }
};

}();
var _elm_lang$core$Char$fromCode = _elm_lang$core$Native_Char.fromCode;
var _elm_lang$core$Char$toCode = _elm_lang$core$Native_Char.toCode;
var _elm_lang$core$Char$toLocaleLower = _elm_lang$core$Native_Char.toLocaleLower;
var _elm_lang$core$Char$toLocaleUpper = _elm_lang$core$Native_Char.toLocaleUpper;
var _elm_lang$core$Char$toLower = _elm_lang$core$Native_Char.toLower;
var _elm_lang$core$Char$toUpper = _elm_lang$core$Native_Char.toUpper;
var _elm_lang$core$Char$isBetween = F3(
	function (low, high, $char) {
		var code = _elm_lang$core$Char$toCode($char);
		return (_elm_lang$core$Native_Utils.cmp(
			code,
			_elm_lang$core$Char$toCode(low)) > -1) && (_elm_lang$core$Native_Utils.cmp(
			code,
			_elm_lang$core$Char$toCode(high)) < 1);
	});
var _elm_lang$core$Char$isUpper = A2(
	_elm_lang$core$Char$isBetween,
	_elm_lang$core$Native_Utils.chr('A'),
	_elm_lang$core$Native_Utils.chr('Z'));
var _elm_lang$core$Char$isLower = A2(
	_elm_lang$core$Char$isBetween,
	_elm_lang$core$Native_Utils.chr('a'),
	_elm_lang$core$Native_Utils.chr('z'));
var _elm_lang$core$Char$isDigit = A2(
	_elm_lang$core$Char$isBetween,
	_elm_lang$core$Native_Utils.chr('0'),
	_elm_lang$core$Native_Utils.chr('9'));
var _elm_lang$core$Char$isOctDigit = A2(
	_elm_lang$core$Char$isBetween,
	_elm_lang$core$Native_Utils.chr('0'),
	_elm_lang$core$Native_Utils.chr('7'));
var _elm_lang$core$Char$isHexDigit = function ($char) {
	return _elm_lang$core$Char$isDigit($char) || (A3(
		_elm_lang$core$Char$isBetween,
		_elm_lang$core$Native_Utils.chr('a'),
		_elm_lang$core$Native_Utils.chr('f'),
		$char) || A3(
		_elm_lang$core$Char$isBetween,
		_elm_lang$core$Native_Utils.chr('A'),
		_elm_lang$core$Native_Utils.chr('F'),
		$char));
};

var _elm_lang$core$String$fromList = _elm_lang$core$Native_String.fromList;
var _elm_lang$core$String$toList = _elm_lang$core$Native_String.toList;
var _elm_lang$core$String$toFloat = _elm_lang$core$Native_String.toFloat;
var _elm_lang$core$String$toInt = _elm_lang$core$Native_String.toInt;
var _elm_lang$core$String$indices = _elm_lang$core$Native_String.indexes;
var _elm_lang$core$String$indexes = _elm_lang$core$Native_String.indexes;
var _elm_lang$core$String$endsWith = _elm_lang$core$Native_String.endsWith;
var _elm_lang$core$String$startsWith = _elm_lang$core$Native_String.startsWith;
var _elm_lang$core$String$contains = _elm_lang$core$Native_String.contains;
var _elm_lang$core$String$all = _elm_lang$core$Native_String.all;
var _elm_lang$core$String$any = _elm_lang$core$Native_String.any;
var _elm_lang$core$String$toLower = _elm_lang$core$Native_String.toLower;
var _elm_lang$core$String$toUpper = _elm_lang$core$Native_String.toUpper;
var _elm_lang$core$String$lines = _elm_lang$core$Native_String.lines;
var _elm_lang$core$String$words = _elm_lang$core$Native_String.words;
var _elm_lang$core$String$trimRight = _elm_lang$core$Native_String.trimRight;
var _elm_lang$core$String$trimLeft = _elm_lang$core$Native_String.trimLeft;
var _elm_lang$core$String$trim = _elm_lang$core$Native_String.trim;
var _elm_lang$core$String$padRight = _elm_lang$core$Native_String.padRight;
var _elm_lang$core$String$padLeft = _elm_lang$core$Native_String.padLeft;
var _elm_lang$core$String$pad = _elm_lang$core$Native_String.pad;
var _elm_lang$core$String$dropRight = _elm_lang$core$Native_String.dropRight;
var _elm_lang$core$String$dropLeft = _elm_lang$core$Native_String.dropLeft;
var _elm_lang$core$String$right = _elm_lang$core$Native_String.right;
var _elm_lang$core$String$left = _elm_lang$core$Native_String.left;
var _elm_lang$core$String$slice = _elm_lang$core$Native_String.slice;
var _elm_lang$core$String$repeat = _elm_lang$core$Native_String.repeat;
var _elm_lang$core$String$join = _elm_lang$core$Native_String.join;
var _elm_lang$core$String$split = _elm_lang$core$Native_String.split;
var _elm_lang$core$String$foldr = _elm_lang$core$Native_String.foldr;
var _elm_lang$core$String$foldl = _elm_lang$core$Native_String.foldl;
var _elm_lang$core$String$reverse = _elm_lang$core$Native_String.reverse;
var _elm_lang$core$String$filter = _elm_lang$core$Native_String.filter;
var _elm_lang$core$String$map = _elm_lang$core$Native_String.map;
var _elm_lang$core$String$length = _elm_lang$core$Native_String.length;
var _elm_lang$core$String$concat = _elm_lang$core$Native_String.concat;
var _elm_lang$core$String$append = _elm_lang$core$Native_String.append;
var _elm_lang$core$String$uncons = _elm_lang$core$Native_String.uncons;
var _elm_lang$core$String$cons = _elm_lang$core$Native_String.cons;
var _elm_lang$core$String$fromChar = function ($char) {
	return A2(_elm_lang$core$String$cons, $char, '');
};
var _elm_lang$core$String$isEmpty = _elm_lang$core$Native_String.isEmpty;

var _elm_lang$core$Tuple$mapSecond = F2(
	function (func, _p0) {
		var _p1 = _p0;
		return {
			ctor: '_Tuple2',
			_0: _p1._0,
			_1: func(_p1._1)
		};
	});
var _elm_lang$core$Tuple$mapFirst = F2(
	function (func, _p2) {
		var _p3 = _p2;
		return {
			ctor: '_Tuple2',
			_0: func(_p3._0),
			_1: _p3._1
		};
	});
var _elm_lang$core$Tuple$second = function (_p4) {
	var _p5 = _p4;
	return _p5._1;
};
var _elm_lang$core$Tuple$first = function (_p6) {
	var _p7 = _p6;
	return _p7._0;
};

//import //

var _elm_lang$core$Native_Platform = function() {


// PROGRAMS

function program(impl)
{
	return function(flagDecoder)
	{
		return function(object, moduleName)
		{
			object['worker'] = function worker(flags)
			{
				if (typeof flags !== 'undefined')
				{
					throw new Error(
						'The `' + moduleName + '` module does not need flags.\n'
						+ 'Call ' + moduleName + '.worker() with no arguments and you should be all set!'
					);
				}

				return initialize(
					impl.init,
					impl.update,
					impl.subscriptions,
					renderer
				);
			};
		};
	};
}

function programWithFlags(impl)
{
	return function(flagDecoder)
	{
		return function(object, moduleName)
		{
			object['worker'] = function worker(flags)
			{
				if (typeof flagDecoder === 'undefined')
				{
					throw new Error(
						'Are you trying to sneak a Never value into Elm? Trickster!\n'
						+ 'It looks like ' + moduleName + '.main is defined with `programWithFlags` but has type `Program Never`.\n'
						+ 'Use `program` instead if you do not want flags.'
					);
				}

				var result = A2(_elm_lang$core$Native_Json.run, flagDecoder, flags);
				if (result.ctor === 'Err')
				{
					throw new Error(
						moduleName + '.worker(...) was called with an unexpected argument.\n'
						+ 'I tried to convert it to an Elm value, but ran into this problem:\n\n'
						+ result._0
					);
				}

				return initialize(
					impl.init(result._0),
					impl.update,
					impl.subscriptions,
					renderer
				);
			};
		};
	};
}

function renderer(enqueue, _)
{
	return function(_) {};
}


// HTML TO PROGRAM

function htmlToProgram(vnode)
{
	var emptyBag = batch(_elm_lang$core$Native_List.Nil);
	var noChange = _elm_lang$core$Native_Utils.Tuple2(
		_elm_lang$core$Native_Utils.Tuple0,
		emptyBag
	);

	return _elm_lang$virtual_dom$VirtualDom$program({
		init: noChange,
		view: function(model) { return main; },
		update: F2(function(msg, model) { return noChange; }),
		subscriptions: function (model) { return emptyBag; }
	});
}


// INITIALIZE A PROGRAM

function initialize(init, update, subscriptions, renderer)
{
	// ambient state
	var managers = {};
	var updateView;

	// init and update state in main process
	var initApp = _elm_lang$core$Native_Scheduler.nativeBinding(function(callback) {
		var model = init._0;
		updateView = renderer(enqueue, model);
		var cmds = init._1;
		var subs = subscriptions(model);
		dispatchEffects(managers, cmds, subs);
		callback(_elm_lang$core$Native_Scheduler.succeed(model));
	});

	function onMessage(msg, model)
	{
		return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback) {
			var results = A2(update, msg, model);
			model = results._0;
			updateView(model);
			var cmds = results._1;
			var subs = subscriptions(model);
			dispatchEffects(managers, cmds, subs);
			callback(_elm_lang$core$Native_Scheduler.succeed(model));
		});
	}

	var mainProcess = spawnLoop(initApp, onMessage);

	function enqueue(msg)
	{
		_elm_lang$core$Native_Scheduler.rawSend(mainProcess, msg);
	}

	var ports = setupEffects(managers, enqueue);

	return ports ? { ports: ports } : {};
}


// EFFECT MANAGERS

var effectManagers = {};

function setupEffects(managers, callback)
{
	var ports;

	// setup all necessary effect managers
	for (var key in effectManagers)
	{
		var manager = effectManagers[key];

		if (manager.isForeign)
		{
			ports = ports || {};
			ports[key] = manager.tag === 'cmd'
				? setupOutgoingPort(key)
				: setupIncomingPort(key, callback);
		}

		managers[key] = makeManager(manager, callback);
	}

	return ports;
}

function makeManager(info, callback)
{
	var router = {
		main: callback,
		self: undefined
	};

	var tag = info.tag;
	var onEffects = info.onEffects;
	var onSelfMsg = info.onSelfMsg;

	function onMessage(msg, state)
	{
		if (msg.ctor === 'self')
		{
			return A3(onSelfMsg, router, msg._0, state);
		}

		var fx = msg._0;
		switch (tag)
		{
			case 'cmd':
				return A3(onEffects, router, fx.cmds, state);

			case 'sub':
				return A3(onEffects, router, fx.subs, state);

			case 'fx':
				return A4(onEffects, router, fx.cmds, fx.subs, state);
		}
	}

	var process = spawnLoop(info.init, onMessage);
	router.self = process;
	return process;
}

function sendToApp(router, msg)
{
	return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
	{
		router.main(msg);
		callback(_elm_lang$core$Native_Scheduler.succeed(_elm_lang$core$Native_Utils.Tuple0));
	});
}

function sendToSelf(router, msg)
{
	return A2(_elm_lang$core$Native_Scheduler.send, router.self, {
		ctor: 'self',
		_0: msg
	});
}


// HELPER for STATEFUL LOOPS

function spawnLoop(init, onMessage)
{
	var andThen = _elm_lang$core$Native_Scheduler.andThen;

	function loop(state)
	{
		var handleMsg = _elm_lang$core$Native_Scheduler.receive(function(msg) {
			return onMessage(msg, state);
		});
		return A2(andThen, loop, handleMsg);
	}

	var task = A2(andThen, loop, init);

	return _elm_lang$core$Native_Scheduler.rawSpawn(task);
}


// BAGS

function leaf(home)
{
	return function(value)
	{
		return {
			type: 'leaf',
			home: home,
			value: value
		};
	};
}

function batch(list)
{
	return {
		type: 'node',
		branches: list
	};
}

function map(tagger, bag)
{
	return {
		type: 'map',
		tagger: tagger,
		tree: bag
	}
}


// PIPE BAGS INTO EFFECT MANAGERS

function dispatchEffects(managers, cmdBag, subBag)
{
	var effectsDict = {};
	gatherEffects(true, cmdBag, effectsDict, null);
	gatherEffects(false, subBag, effectsDict, null);

	for (var home in managers)
	{
		var fx = home in effectsDict
			? effectsDict[home]
			: {
				cmds: _elm_lang$core$Native_List.Nil,
				subs: _elm_lang$core$Native_List.Nil
			};

		_elm_lang$core$Native_Scheduler.rawSend(managers[home], { ctor: 'fx', _0: fx });
	}
}

function gatherEffects(isCmd, bag, effectsDict, taggers)
{
	switch (bag.type)
	{
		case 'leaf':
			var home = bag.home;
			var effect = toEffect(isCmd, home, taggers, bag.value);
			effectsDict[home] = insert(isCmd, effect, effectsDict[home]);
			return;

		case 'node':
			var list = bag.branches;
			while (list.ctor !== '[]')
			{
				gatherEffects(isCmd, list._0, effectsDict, taggers);
				list = list._1;
			}
			return;

		case 'map':
			gatherEffects(isCmd, bag.tree, effectsDict, {
				tagger: bag.tagger,
				rest: taggers
			});
			return;
	}
}

function toEffect(isCmd, home, taggers, value)
{
	function applyTaggers(x)
	{
		var temp = taggers;
		while (temp)
		{
			x = temp.tagger(x);
			temp = temp.rest;
		}
		return x;
	}

	var map = isCmd
		? effectManagers[home].cmdMap
		: effectManagers[home].subMap;

	return A2(map, applyTaggers, value)
}

function insert(isCmd, newEffect, effects)
{
	effects = effects || {
		cmds: _elm_lang$core$Native_List.Nil,
		subs: _elm_lang$core$Native_List.Nil
	};
	if (isCmd)
	{
		effects.cmds = _elm_lang$core$Native_List.Cons(newEffect, effects.cmds);
		return effects;
	}
	effects.subs = _elm_lang$core$Native_List.Cons(newEffect, effects.subs);
	return effects;
}


// PORTS

function checkPortName(name)
{
	if (name in effectManagers)
	{
		throw new Error('There can only be one port named `' + name + '`, but your program has multiple.');
	}
}


// OUTGOING PORTS

function outgoingPort(name, converter)
{
	checkPortName(name);
	effectManagers[name] = {
		tag: 'cmd',
		cmdMap: outgoingPortMap,
		converter: converter,
		isForeign: true
	};
	return leaf(name);
}

var outgoingPortMap = F2(function cmdMap(tagger, value) {
	return value;
});

function setupOutgoingPort(name)
{
	var subs = [];
	var converter = effectManagers[name].converter;

	// CREATE MANAGER

	var init = _elm_lang$core$Native_Scheduler.succeed(null);

	function onEffects(router, cmdList, state)
	{
		while (cmdList.ctor !== '[]')
		{
			// grab a separate reference to subs in case unsubscribe is called
			var currentSubs = subs;
			var value = converter(cmdList._0);
			for (var i = 0; i < currentSubs.length; i++)
			{
				currentSubs[i](value);
			}
			cmdList = cmdList._1;
		}
		return init;
	}

	effectManagers[name].init = init;
	effectManagers[name].onEffects = F3(onEffects);

	// PUBLIC API

	function subscribe(callback)
	{
		subs.push(callback);
	}

	function unsubscribe(callback)
	{
		// copy subs into a new array in case unsubscribe is called within a
		// subscribed callback
		subs = subs.slice();
		var index = subs.indexOf(callback);
		if (index >= 0)
		{
			subs.splice(index, 1);
		}
	}

	return {
		subscribe: subscribe,
		unsubscribe: unsubscribe
	};
}


// INCOMING PORTS

function incomingPort(name, converter)
{
	checkPortName(name);
	effectManagers[name] = {
		tag: 'sub',
		subMap: incomingPortMap,
		converter: converter,
		isForeign: true
	};
	return leaf(name);
}

var incomingPortMap = F2(function subMap(tagger, finalTagger)
{
	return function(value)
	{
		return tagger(finalTagger(value));
	};
});

function setupIncomingPort(name, callback)
{
	var sentBeforeInit = [];
	var subs = _elm_lang$core$Native_List.Nil;
	var converter = effectManagers[name].converter;
	var currentOnEffects = preInitOnEffects;
	var currentSend = preInitSend;

	// CREATE MANAGER

	var init = _elm_lang$core$Native_Scheduler.succeed(null);

	function preInitOnEffects(router, subList, state)
	{
		var postInitResult = postInitOnEffects(router, subList, state);

		for(var i = 0; i < sentBeforeInit.length; i++)
		{
			postInitSend(sentBeforeInit[i]);
		}

		sentBeforeInit = null; // to release objects held in queue
		currentSend = postInitSend;
		currentOnEffects = postInitOnEffects;
		return postInitResult;
	}

	function postInitOnEffects(router, subList, state)
	{
		subs = subList;
		return init;
	}

	function onEffects(router, subList, state)
	{
		return currentOnEffects(router, subList, state);
	}

	effectManagers[name].init = init;
	effectManagers[name].onEffects = F3(onEffects);

	// PUBLIC API

	function preInitSend(value)
	{
		sentBeforeInit.push(value);
	}

	function postInitSend(value)
	{
		var temp = subs;
		while (temp.ctor !== '[]')
		{
			callback(temp._0(value));
			temp = temp._1;
		}
	}

	function send(incomingValue)
	{
		var result = A2(_elm_lang$core$Json_Decode$decodeValue, converter, incomingValue);
		if (result.ctor === 'Err')
		{
			throw new Error('Trying to send an unexpected type of value through port `' + name + '`:\n' + result._0);
		}

		currentSend(result._0);
	}

	return { send: send };
}

return {
	// routers
	sendToApp: F2(sendToApp),
	sendToSelf: F2(sendToSelf),

	// global setup
	effectManagers: effectManagers,
	outgoingPort: outgoingPort,
	incomingPort: incomingPort,

	htmlToProgram: htmlToProgram,
	program: program,
	programWithFlags: programWithFlags,
	initialize: initialize,

	// effect bags
	leaf: leaf,
	batch: batch,
	map: F2(map)
};

}();

//import Native.Utils //

var _elm_lang$core$Native_Scheduler = function() {

var MAX_STEPS = 10000;


// TASKS

function succeed(value)
{
	return {
		ctor: '_Task_succeed',
		value: value
	};
}

function fail(error)
{
	return {
		ctor: '_Task_fail',
		value: error
	};
}

function nativeBinding(callback)
{
	return {
		ctor: '_Task_nativeBinding',
		callback: callback,
		cancel: null
	};
}

function andThen(callback, task)
{
	return {
		ctor: '_Task_andThen',
		callback: callback,
		task: task
	};
}

function onError(callback, task)
{
	return {
		ctor: '_Task_onError',
		callback: callback,
		task: task
	};
}

function receive(callback)
{
	return {
		ctor: '_Task_receive',
		callback: callback
	};
}


// PROCESSES

function rawSpawn(task)
{
	var process = {
		ctor: '_Process',
		id: _elm_lang$core$Native_Utils.guid(),
		root: task,
		stack: null,
		mailbox: []
	};

	enqueue(process);

	return process;
}

function spawn(task)
{
	return nativeBinding(function(callback) {
		var process = rawSpawn(task);
		callback(succeed(process));
	});
}

function rawSend(process, msg)
{
	process.mailbox.push(msg);
	enqueue(process);
}

function send(process, msg)
{
	return nativeBinding(function(callback) {
		rawSend(process, msg);
		callback(succeed(_elm_lang$core$Native_Utils.Tuple0));
	});
}

function kill(process)
{
	return nativeBinding(function(callback) {
		var root = process.root;
		if (root.ctor === '_Task_nativeBinding' && root.cancel)
		{
			root.cancel();
		}

		process.root = null;

		callback(succeed(_elm_lang$core$Native_Utils.Tuple0));
	});
}

function sleep(time)
{
	return nativeBinding(function(callback) {
		var id = setTimeout(function() {
			callback(succeed(_elm_lang$core$Native_Utils.Tuple0));
		}, time);

		return function() { clearTimeout(id); };
	});
}


// STEP PROCESSES

function step(numSteps, process)
{
	while (numSteps < MAX_STEPS)
	{
		var ctor = process.root.ctor;

		if (ctor === '_Task_succeed')
		{
			while (process.stack && process.stack.ctor === '_Task_onError')
			{
				process.stack = process.stack.rest;
			}
			if (process.stack === null)
			{
				break;
			}
			process.root = process.stack.callback(process.root.value);
			process.stack = process.stack.rest;
			++numSteps;
			continue;
		}

		if (ctor === '_Task_fail')
		{
			while (process.stack && process.stack.ctor === '_Task_andThen')
			{
				process.stack = process.stack.rest;
			}
			if (process.stack === null)
			{
				break;
			}
			process.root = process.stack.callback(process.root.value);
			process.stack = process.stack.rest;
			++numSteps;
			continue;
		}

		if (ctor === '_Task_andThen')
		{
			process.stack = {
				ctor: '_Task_andThen',
				callback: process.root.callback,
				rest: process.stack
			};
			process.root = process.root.task;
			++numSteps;
			continue;
		}

		if (ctor === '_Task_onError')
		{
			process.stack = {
				ctor: '_Task_onError',
				callback: process.root.callback,
				rest: process.stack
			};
			process.root = process.root.task;
			++numSteps;
			continue;
		}

		if (ctor === '_Task_nativeBinding')
		{
			process.root.cancel = process.root.callback(function(newRoot) {
				process.root = newRoot;
				enqueue(process);
			});

			break;
		}

		if (ctor === '_Task_receive')
		{
			var mailbox = process.mailbox;
			if (mailbox.length === 0)
			{
				break;
			}

			process.root = process.root.callback(mailbox.shift());
			++numSteps;
			continue;
		}

		throw new Error(ctor);
	}

	if (numSteps < MAX_STEPS)
	{
		return numSteps + 1;
	}
	enqueue(process);

	return numSteps;
}


// WORK QUEUE

var working = false;
var workQueue = [];

function enqueue(process)
{
	workQueue.push(process);

	if (!working)
	{
		setTimeout(work, 0);
		working = true;
	}
}

function work()
{
	var numSteps = 0;
	var process;
	while (numSteps < MAX_STEPS && (process = workQueue.shift()))
	{
		if (process.root)
		{
			numSteps = step(numSteps, process);
		}
	}
	if (!process)
	{
		working = false;
		return;
	}
	setTimeout(work, 0);
}


return {
	succeed: succeed,
	fail: fail,
	nativeBinding: nativeBinding,
	andThen: F2(andThen),
	onError: F2(onError),
	receive: receive,

	spawn: spawn,
	kill: kill,
	sleep: sleep,
	send: F2(send),

	rawSpawn: rawSpawn,
	rawSend: rawSend
};

}();
var _elm_lang$core$Platform_Cmd$batch = _elm_lang$core$Native_Platform.batch;
var _elm_lang$core$Platform_Cmd$none = _elm_lang$core$Platform_Cmd$batch(
	{ctor: '[]'});
var _elm_lang$core$Platform_Cmd_ops = _elm_lang$core$Platform_Cmd_ops || {};
_elm_lang$core$Platform_Cmd_ops['!'] = F2(
	function (model, commands) {
		return {
			ctor: '_Tuple2',
			_0: model,
			_1: _elm_lang$core$Platform_Cmd$batch(commands)
		};
	});
var _elm_lang$core$Platform_Cmd$map = _elm_lang$core$Native_Platform.map;
var _elm_lang$core$Platform_Cmd$Cmd = {ctor: 'Cmd'};

var _elm_lang$core$Platform_Sub$batch = _elm_lang$core$Native_Platform.batch;
var _elm_lang$core$Platform_Sub$none = _elm_lang$core$Platform_Sub$batch(
	{ctor: '[]'});
var _elm_lang$core$Platform_Sub$map = _elm_lang$core$Native_Platform.map;
var _elm_lang$core$Platform_Sub$Sub = {ctor: 'Sub'};

var _elm_lang$core$Platform$hack = _elm_lang$core$Native_Scheduler.succeed;
var _elm_lang$core$Platform$sendToSelf = _elm_lang$core$Native_Platform.sendToSelf;
var _elm_lang$core$Platform$sendToApp = _elm_lang$core$Native_Platform.sendToApp;
var _elm_lang$core$Platform$programWithFlags = _elm_lang$core$Native_Platform.programWithFlags;
var _elm_lang$core$Platform$program = _elm_lang$core$Native_Platform.program;
var _elm_lang$core$Platform$Program = {ctor: 'Program'};
var _elm_lang$core$Platform$Task = {ctor: 'Task'};
var _elm_lang$core$Platform$ProcessId = {ctor: 'ProcessId'};
var _elm_lang$core$Platform$Router = {ctor: 'Router'};

var _billstclair$elm_dev_random$DicewareStrings$dicewareStrings = {
	ctor: '::',
	_0: 'a,a&p,a\'s,aa,aaa,aaaa,aaron,ab,aba,ababa,aback,abase,abash,abate,abbas,abbe,abbey,abbot,abbott,abc,abe,abed,abel,abet,abide,abject,ablaze,able,abner,abo,abode,abort,about,above,abrade,abram,absorb,abuse,abut,abyss,ac,acadia,accra,accrue,ace,acetic,ache,acid,acidic,acm,acme,acorn,acre,acrid,act,acton,actor,acts,acuity,acute,ad,ada,adage,adagio,adair,adam,adams,adapt,add,added,addict,addis,addle,adele,aden,adept,adieu,adjust,adler,admit,admix,ado,adobe,adonis,adopt,adore,adorn,adult,advent,advert,advise,ae,aegis,aeneid,af,afar,affair,affine,affix,afire,afoot,afraid,africa,afro,aft,ag,again,agate,agave,age,agee,agenda,agent,agile,aging,agnes,agnew,ago,agone,agony,agree,ague,agway,ah,ahead,ahem,ahoy,ai,aid,aida,aide,aides,aiken,ail,aile,aim,ain\'t,ainu,air,aires,airman,airway,airy,aisle,aj,ajar,ajax,ak,akers,akin,akron,al,ala,alai,alamo,alan,alarm,alaska,alb,alba,album,alcoa,alden,alder,ale,alec,aleck,aleph,alert,alex,alexei,alga,algae,algal,alger,algol,ali,alia,alias,alibi,alice,alien,alight,align,alike,alive,all,allah,allan,allay,allen,alley,allied,allis,allot,allow,alloy,allure,ally,allyl,allyn,alma,almost,aloe,aloft,aloha,alone,along,aloof,aloud,alp,alpha,alps',
	_1: {
		ctor: '::',
		_0: 'also,alsop,altair,altar,alter,alto,alton,alum,alumni,alva,alvin,alway,am,ama,amass,amaze,amber,amble,ambush,amen,amend,ames,ami,amid,amide,amigo,amino,amiss,amity,amman,ammo,amoco,amok,among,amort,amos,amp,ampere,ampex,ample,amply,amra,amulet,amuse,amy,an,ana,and,andes,andre,andrew,andy,anent,anew,angel,angelo,anger,angie,angle,anglo,angola,angry,angst,angus,ani,anion,anise,anita,ankle,ann,anna,annal,anne,annex,annie,annoy,annul,annuli,annum,anode,ansi,answer,ant,ante,anti,antic,anton,anus,anvil,any,anyhow,anyway,ao,aok,aorta,ap,apart,apathy,ape,apex,aphid,aplomb,appeal,append,apple,apply,april,apron,apse,apt,aq,aqua,ar,arab,araby,arc',
		_1: {
			ctor: '::',
			_0: 'arcana,arch,archer,arden,ardent,are,area,arena,ares,argive,argo,argon,argot,argue,argus,arhat,arid,aries,arise,ark,arlen,arlene,arm,armco,army,arnold,aroma,arose,arpa,array,arrear,arrow,arson,art,artery,arthur,artie,arty,aruba,arum,aryl,as,ascend,ash,ashen,asher,ashley,ashy,asia,aside,ask,askew,asleep,aspen,aspire,ass,assai,assam,assay,asset,assort,assure,aster,astm,astor,astral,at,at&t,ate,athens,atlas,atom,atomic,atone,atop,attic,attire,au,aubrey,audio,audit,aug,auger,augur,august,auk,aunt,aura,aural,auric,austin,auto,autumn,av,avail,ave,aver,avert,avery,aviate,avid,avis,aviv,avoid,avon,avow,aw,await,awake,award,aware,awash,away,awe,awful,awl,awn,awoke,awry,ax,axe,axes,axial,axiom,axis,axle,axon,ay,aye,ayers,az,aztec,azure,b,b\'s,ba,babe,babel,baby,bach,back,backup,bacon,bad,bade,baden,badge,baffle,bag,baggy,bah,bahama,bail,baird,bait,bake,baku,bald,baldy,bale,bali,balk,balkan,balky,ball,balled,ballot,balm,balmy,balsa,bam,bambi,ban,banal,band,bandit,bandy,bane,bang,banish,banjo,bank,banks,bantu,bar,barb,bard,bare,barfly,barge,bark,barley,barn,barnes,baron,barony,barr,barre,barry,barter,barth,barton,basal,base,basel,bash,basic,basil,basin,basis,bask,bass,bassi,basso',
			_1: {
				ctor: '::',
				_0: 'baste,bat,batch,bate,bater,bates,bath,bathe,batik,baton,bator,batt,bauble,baud,bauer,bawd,bawdy,bawl,baxter,bay,bayda,bayed,bayou,bazaar,bb,bbb,bbbb,bc,bcd,bd,be,beach,bead,beady,beak,beam,bean,bear,beard,beast,beat,beau,beauty,beaux,bebop,becalm,beck,becker,becky,bed,bedim,bee,beebe,beech,beef,beefy,been,beep,beer,beet,befall,befit,befog,beg,began,beget,beggar,begin,begun,behind,beige,being,beirut,bel,bela,belch,belfry,belie,bell,bella,belle,belly,below,belt,bema,beman,bemoan,ben,bench,bend,bender,benny,bent,benz,berea,bereft,beret,berg,berlin,bern,berne,bernet,berra,berry,bert,berth,beryl,beset,bess,bessel,best,bestir,bet,beta,betel,beth,bethel,betsy,bette,betty,bevel,bevy,beware,bey,bezel,bf,bg,bh,bhoy,bi,bias,bib,bibb,bible,bicep,biceps,bid,biddy,bide,bien,big,biggs,bigot,bile,bilge,bilk,bill,billow,billy,bin,binary,bind,bing,binge,bingle,bini,biota,birch,bird,birdie,birth,bison,bisque,bit,bitch,bite,bitt,bitten,biz,bizet,bj,bk,bl,blab,black,blade,blair,blake,blame,blanc,bland,blank,blare,blast,blat,blatz,blaze,bleak,bleat,bled,bleed,blend,bless,blest,blew,blimp,blind,blink,blinn,blip,bliss,blithe,blitz,bloat,blob,bloc,bloch,block,bloke,blond,blonde,blood,bloom,bloop,blot,blotch',
				_1: {
					ctor: '::',
					_0: 'blow,blown,blue,bluet,bluff,blum,blunt,blur,blurt,blush,blvd,blythe,bm,bmw,bn,bo,boa,boar,board,boast,boat,bob,bobbin,bobby,bobcat,boca,bock,bode,body,bog,bogey,boggy,bogus,bogy,bohr,boil,bois,boise,bold,bole,bolo,bolt,bomb,bombay,bon,bona,bond,bone,bong,bongo,bonn,bonus,bony,bonze,boo,booby,boogie,book,booky,boom,boon,boone,boor,boost,boot,booth,booty,booze,bop,borax,border,bore,borg,boric,boris,born,borne,borneo,boron,bosch,bose,bosom,boson,boss,boston,botch,both,bottle,bough,bouncy,bound,bourn,bout,bovine,bow,bowel,bowen,bowie,bowl,box,boxy,boy,boyar,boyce,boyd,boyle,bp,bq,br,brace,bract,brad,brady,brae,brag,bragg,braid,brain,brainy,brake,bran,brand,brandt,brant,brash,brass,brassy,braun,brave,bravo,brawl,bray,bread,break,bream,breath,bred,breed,breeze,bremen,brent,brest,brett,breve,brew,brian,briar,bribe,brice,brick,bride,brief,brig,briggs,brim,brine,bring,brink,briny,brisk,broad,brock,broil,broke,broken,bronx,brood,brook,brooke,broom,broth,brow,brown,browse,bruce,bruit,brunch,bruno,brunt,brush,brute,bryan,bryant,bryce,bryn,bs,bstj,bt,btl,bu,bub,buck,bud,budd,buddy,budge,buena,buenos,buff,bug,buggy,bugle,buick,build,built,bulb,bulge,bulk,bulky,bull,bully,bum,bump,bun,bunch,bundy',
					_1: {
						ctor: '::',
						_0: 'bunk,bunny,bunt,bunyan,buoy,burch,bureau,buret,burg,buried,burke,burl,burly,burma,burn,burnt,burp,burr,burro,burst,burt,burton,burtt,bury,bus,busch,bush,bushel,bushy,buss,bust,busy,but,butane,butch,buteo,butt,butte,butyl,buxom,buy,buyer,buzz,buzzy,bv,bw,bx,by,bye,byers,bylaw,byline,byrd,byrne,byron,byte,byway,byword,bz,c,c\'s,ca,cab,cabal,cabin,cable,cabot,cacao,cache,cacm,cacti,caddy,cadent,cadet,cadre,cady,cafe,cage,cagey,cahill,caiman,cain,caine,cairn,cairo,cake,cal,calder,caleb,calf,call,calla,callus,calm,calve,cam,camber,came,camel,cameo,camp,can,can\'t,canal,canary,cancer,candle,candy,cane,canis,canna,cannot,canny,canoe,canon,canopy,cant,canto,canton,cap,cape,caper,capo,car,carbon,card,care,caress,caret,carey,cargo,carib,carl,carla,carlo,carne,carob,carol,carp,carpet,carr,carrie,carry,carson,cart,carte,caruso,carve,case,casey,cash,cashew,cask,casket,cast,caste,cat,catch,cater,cathy,catkin,catsup,cauchy,caulk,cause,cave,cavern,cavil,cavort,caw,cayuga,cb,cbs,cc,ccc,cccc,cd,cdc,ce,cease,cecil,cedar,cede,ceil,celia,cell,census,cent,ceres,cern,cetera,cetus,cf,cg,ch,chad,chafe,chaff,chai,chain,chair,chalk,champ,chance,chang,chant,chao,chaos,chap,chapel,char,chard,charm,chart',
						_1: {
							ctor: '::',
							_0: 'chase,chasm,chaste,chat,chaw,cheap,cheat,check,cheek,cheeky,cheer,chef,chen,chert,cherub,chess,chest,chevy,chew,chi,chic,chick,chide,chief,child,chile,chili,chill,chilly,chime,chin,china,chine,chink,chip,chirp,chisel,chit,chive,chock,choir,choke,chomp,chop,chopin,choral,chord,chore,chose,chosen,chou,chow,chris,chub,chuck,chuff,chug,chum,chump,chunk,churn,chute,ci,cia,cicada,cider,cigar,cilia,cinch,cindy,cipher,circa,circe,cite,citrus,city,civet,civic,civil,cj,ck,cl,clad,claim,clam,clammy,clamp,clan,clang,clank,clap,clara,clare,clark,clarke,clash,clasp,class,claus,clause,claw,clay,clean,clear,cleat,cleft,clerk,cliche,click,cliff,climb,clime,cling,clink,clint,clio,clip,clive,cloak,clock,clod,clog,clomp,clone,close,closet,clot,cloth,cloud,clout,clove,clown,cloy,club,cluck,clue,cluj,clump,clumsy,clung,clyde,cm,cn,co,coach,coal,coast,coat,coax,cobb,cobble,cobol,cobra,coca,cock,cockle,cocky,coco,cocoa,cod,coda,coddle,code,codon,cody,coed,cog,cogent,cohen,cohn,coil,coin,coke,col,cola,colby,cold,cole,colon,colony,colt,colza,coma,comb,combat,come,comet,cometh,comic,comma,con,conch,cone,coney,congo,conic,conn,conner,conway,cony,coo,cook,cooke,cooky,cool,cooley,coon,coop,coors,coot,cop,cope,copra,copy,coral,corbel',
							_1: {
								ctor: '::',
								_0: 'cord,core,corey,cork,corn,corny,corp,corps,corvus,cos,cosec,coset,cosh,cost,costa,cosy,cot,cotta,cotty,couch,cough,could,count,coup,coupe,court,cousin,cove,coven,cover,covet,cow,cowan,cowl,cowman,cowry,cox,coy,coyote,coypu,cozen,cozy,cp,cpa,cq,cr,crab,crack,craft,crag,craig,cram,cramp,crane,crank,crap,crash,crass,crate,crater,crave,craw,crawl,craze,crazy,creak,cream,credit,credo,creed,creek,creep,creole,creon,crepe,crept,cress,crest,crete,crew,crib,cried,crime,crimp,crisp,criss,croak,crock,crocus,croft,croix,crone,crony,crook,croon,crop,cross,crow,crowd,crown,crt,crud,crude,cruel,crumb,crump,crush,crust,crux,cruz,cry,crypt,cs,ct,cu,cub,cuba,cube,cubic,cud,cuddle,cue,cuff,cull,culpa,cult,cumin,cuny,cup,cupful,cupid,cur,curb,curd,cure,curfew,curia,curie,curio,curl,curry,curse,curt,curve,cusp,cut,cute,cutlet,cv,cw,cx,cy,cycad,cycle,cynic,cyril,cyrus,cyst,cz,czar,czech,d,d\'art,d\'s,da,dab,dacca,dactyl,dad,dada,daddy,dade,daffy,dahl,dahlia,dairy,dais,daisy,dakar,dale,daley,dally,daly,dam,dame,damn,damon,damp,damsel,dan,dana,dance,dandy,dane,dang,dank,danny,dante,dar,dare,dark,darken,darn,darry,dart,dash,data,date,dater,datum,daub,daunt,dave,david',
								_1: {
									ctor: '::',
									_0: 'davis,davit,davy,dawn,dawson,day,daze,db,dc,dd,ddd,dddd,de,deacon,dead,deaf,deal,dealt,dean,deane,dear,death,debar,debby,debit,debra,debris,debt,debug,debut,dec,decal,decay,decca,deck,decker,decor,decree,decry,dee,deed,deem,deep,deer,deere,def,defer,deform,deft,defy,degas,degum,deify,deign,deity,deja,del,delay,delft,delhi,delia,dell,della,delta,delve,demark,demit,demon,demur,den,deneb,denial,denny,dense,dent,denton,deny,depot,depth,depute,derby,derek,des,desist,desk,detach,deter,deuce,deus,devil,devoid,devon,dew,dewar,dewey,dewy,dey,df,dg,dh,dhabi,di,dial,diana,diane,diary,dibble,dice,dick,dicta,did,dido,die,died,diego,diem,diesel,diet,diety,dietz,dig,digit,dilate,dill,dim,dime,din,dinah,dine,ding,dingo,dingy,dint,diode,dip,dirac,dire,dirge,dirt,dirty,dis,disc,dish,disk,disney,ditch,ditto,ditty,diva,divan,dive,dixie,dixon,dizzy,dj,dk,dl,dm,dn,dna,do,dobbs,dobson,dock,docket,dod,dodd,dodge,dodo,doe,doff,dog,doge,dogma,dolan,dolce,dole,doll,dolly,dolt,dome,don,don\'t,done,doneck,donna,donor,doom,door,dope,dora,doria,doric,doris,dose,dot,dote,double,doubt,douce,doug,dough,dour,douse,dove,dow,dowel,down,downs,dowry,doyle,doze,dozen,dp,dq',
									_1: {
										ctor: '::',
										_0: 'dr,drab,draco,draft,drag,drain,drake,dram,drama,drank,drape,draw,drawl,drawn,dread,dream,dreamy,dreg,dress,dressy,drew,drib,dried,drier,drift,drill,drink,drip,drive,droll,drone,drool,droop,drop,dross,drove,drown,drub,drug,druid,drum,drunk,drury,dry,dryad,ds,dt,du,dual,duane,dub,dubhe,dublin,ducat,duck,duct,dud,due,duel,duet,duff,duffy,dug,dugan,duke,dull,dully,dulse,duly,duma,dumb,dummy,dump,dumpy,dun,dunce,dune,dung,dunham,dunk,dunlop,dunn,dupe,durer,dusk,dusky,dust,dusty,dutch,duty,dv,dw,dwarf,dwell,dwelt,dwight,dwyer,dx,dy,dyad,dye,dyer,dying,dyke,dylan,dyne,dz,e,e\'er,e\'s,ea,each,eagan,eager,eagle,ear,earl,earn,earth,ease,easel,east,easy,eat,eaten,eater,eaton,eave,eb,ebb,eben,ebony,ec,echo,eclat,ecole,ed,eddie,eddy,eden,edgar,edge,edgy,edict,edify,edit,edith,editor,edna,edt,edwin,ee,eee,eeee,eel,eeoc,eerie,ef,efface,effie,efg,eft,eg,egan,egg,ego,egress,egret,egypt,eh,ei,eider,eight,eire,ej,eject,ek,eke,el,elan,elate,elba,elbow,elder,eldon,elect,elegy,elena,eleven,elfin,elgin,eli,elide,eliot,elite,elk,ell,ella,ellen,ellis,elm,elmer,elope,else,elsie,elton,elude,elute,elves,ely,em,embalm,embark,embed',
										_1: {
											ctor: '::',
											_0: 'ember,emcee,emery,emil,emile,emily,emit,emma,emory,empty,en,enact,enamel,end,endow,enemy,eng,engel,engle,engulf,enid,enjoy,enmity,enoch,enol,enos,enrico,ensue,enter,entrap,entry,envoy,envy,eo,ep,epa,epic,epoch,epoxy,epsom,eq,equal,equip,er,era,erase,erato,erda,ere,erect,erg,eric,erich,erie,erik,ernest,ernie,ernst,erode,eros,err,errand,errol,error,erupt,ervin,erwin,es,essay,essen,essex,est,ester,estes,estop,et,eta,etc,etch,ethan,ethel,ether,ethic,ethos,ethyl,etude,eu,eucre,euler,eureka,ev,eva,evade,evans,eve,even,event,every,evict,evil,evoke,evolve,ew,ewe,ewing,ex,exact,exalt,exam,excel,excess,exert,exile,exist,exit,exodus,expel,extant,extent,extol,extra,exude,exult,exxon,ey,eye,eyed,ez,ezra,f,f\'s,fa,faa,faber,fable,face,facet,facile,fact,facto,fad,fade,faery,fag,fahey,fail,fain,faint,fair,fairy,faith,fake,fall,false,fame,fan,fancy,fang,fanny,fanout,far,farad,farce,fare,fargo,farley,farm,faro,fast,fat,fatal,fate,fatty,fault,faun,fauna,faust,fawn,fay,faze,fb,fbi,fc,fcc,fd,fda,fe,fear,feast,feat,feb,fed,fee,feed,feel,feet,feign,feint,felice,felix,fell,felon,felt,femur,fence,fend,fermi,fern,ferric,ferry,fest,fetal,fetch,fete,fetid',
											_1: {
												ctor: '::',
												_0: 'fetus,feud,fever,few,ff,fff,ffff,fg,fgh,fh,fi,fiat,fib,fibrin,fiche,fide,fief,field,fiend,fiery,fife,fifo,fifth,fifty,fig,fight,filch,file,filet,fill,filler,filly,film,filmy,filth,fin,final,finale,finch,find,fine,finite,fink,finn,finny,fir,fire,firm,first,fish,fishy,fisk,fiske,fist,fit,fitch,five,fix,fj,fjord,fk,fl,flack,flag,flail,flair,flak,flake,flaky,flam,flame,flank,flap,flare,flash,flask,flat,flatus,flaw,flax,flea,fleck,fled,flee,fleet,flesh,flew,flex,flick,flier,flinch,fling,flint,flip,flirt,flit,flo,float,floc,flock,floe,flog,flood,floor,flop,floppy,flora,flour,flout,flow,flown,floyd,flu,flub,flue,fluff,fluid,fluke,flung,flush,flute,flux,fly,flyer,flynn,fm,fmc,fn,fo,foal,foam,foamy,fob,focal,foci,focus,fodder,foe,fog,foggy,fogy,foil,foist,fold,foley,folio,folk,folly,fond,font,food,fool,foot,foote,fop,for,foray,force,ford,fore,forge,forgot,fork,form,fort,forte,forth,forty,forum,foss,fossil,foul,found,fount,four,fovea,fowl,fox,foxy,foyer,fp,fpc,fq,fr,frail,frame,fran,franc,franca,frank,franz,frau,fraud,fray,freak,fred,free,freed,freer,frenzy,freon,fresh,fret,freud,frey,freya,friar,frick,fried,frill,frilly,frisky,fritz,fro,frock,frog',
												_1: {
													ctor: '::',
													_0: 'from,front,frost,froth,frown,froze,fruit,fry,frye,fs,ft,ftc,fu,fuchs,fudge,fuel,fugal,fugue,fuji,full,fully,fum,fume,fun,fund,fungal,fungi,funk,funny,fur,furl,furry,fury,furze,fuse,fuss,fussy,fusty,fuzz,fuzzy,fv,fw,fx,fy,fz,g,g\'s,ga,gab,gable,gabon,gad,gadget,gaff,gaffe,gag,gage,gail,gain,gait,gal,gala,galaxy,gale,galen,gall,gallop,galt,gam,game,gamin,gamma,gamut,gander,gang,gao,gap,gape,gar,garb,garish,garner,garry,garth,gary,gas,gash,gasp,gassy,gate,gates,gator,gauche,gaudy,gauge,gaul,gaunt,gaur,gauss,gauze,gave,gavel,gavin,gawk,gawky,gay,gaze,gb,gc,gd,ge,gear,gecko,gee,geese,geigy,gel,geld,gem,gemma,gene,genie,genii,genoa,genre,gent,gentry,genus,gerbil,germ,gerry,get,getty,gf,gg,ggg,gggg,gh,ghana,ghent,ghetto,ghi,ghost,ghoul,gi,giant,gibbs,gibby,gibe,giddy,gift,gig,gil,gila,gild,giles,gill,gilt,gimbal,gimpy,gin,gina,ginn,gino,gird,girl,girth,gist,give,given,gj,gk,gl,glad,gladdy,glade,glamor,gland,glans,glare,glass,glaze,gleam,glean,glee,glen,glenn,glib,glide,glint,gloat,glob,globe,glom,gloom,glory,gloss,glove,glow,glue,glued,gluey,gluing,glum,glut,glyph,gm,gmt,gn,gnarl,gnash,gnat,gnaw,gnome,gnp',
													_1: {
														ctor: '::',
														_0: 'gnu,go,goa,goad,goal,goat,gob,goer,goes,goff,gog,goggle,gogh,gogo,gold,golf,golly,gone,gong,goo,good,goode,goody,goof,goofy,goose,gop,gordon,gore,goren,gorge,gorky,gorse,gory,gosh,gospel,got,gouda,gouge,gould,gourd,gout,gown,gp,gpo,gq,gr,grab,grace,grad,grade,grady,graff,graft,grail,grain,grand,grant,grape,graph,grasp,grass,grata,grate,grater,grave,gravy,gray,graze,great,grebe,greed,greedy,greek,green,greer,greet,greg,gregg,greta,grew,grey,grid,grief,grieve,grill,grim,grime,grimm,grin,grind,grip,gripe,grist,grit,groan,groat,groin,groom,grope,gross,groton,group,grout,grove,grow,growl,grown,grub,gruff,grunt,gs,gsa,gt,gu,guam,guano,guard,guess,guest,guide,guild,guile,guilt,guise,guitar,gules,gulf,gull,gully,gulp,gum,gumbo,gummy,gun,gunk,gunky,gunny,gurgle,guru,gus,gush,gust,gusto,gusty,gut,gutsy,guy,guyana,gv,gw,gwen,gwyn,gx,gy,gym,gyp,gypsy,gyro,gz,h,h\'s,ha,haag,haas,habib,habit,hack,had,hades,hadron,hagen,hager,hague,hahn,haifa,haiku,hail,hair,hairy,haiti,hal,hale,haley,half,hall,halma,halo,halt,halvah,halve,ham,hamal,hamlin,han,hand,handy,haney,hang,hank,hanna,hanoi,hans,hansel,hap,happy,hard,hardy,hare,harem,hark,harley,harm,harp,harpy',
														_1: {
															ctor: '::',
															_0: 'harry,harsh,hart,harvey,hash,hasp,hast,haste,hasty,hat,hatch,hate,hater,hath,hatred,haul,haunt,have,haven,havoc,haw,hawk,hay,haydn,hayes,hays,hazard,haze,hazel,hazy,hb,hc,hd,he,he\'d,he\'ll,head,heady,heal,healy,heap,hear,heard,heart,heat,heath,heave,heavy,hebe,hebrew,heck,heckle,hedge,heed,heel,heft,hefty,heigh,heine,heinz,heir,held,helen,helga,helix,hell,hello,helm,helmut,help,hem,hemp,hen,hence,henri,henry,her,hera,herb,herd,here,hero,heroic,heron,herr,hertz,hess,hesse,hettie,hetty,hew,hewitt,hewn,hex,hey,hf,hg,hh,hhh,hhhh,hi,hiatt,hick,hicks,hid,hide,high,hij,hike,hill,hilly,hilt,hilum,him,hind,hindu,hines,hinge,hint,hip,hippo,hippy,hiram,hire,hirsch,his,hiss,hit,hitch,hive,hj,hk,hl,hm,hn,ho,hoagy,hoar,hoard,hob,hobbs,hobby,hobo,hoc,hock,hodge,hodges,hoe,hoff,hog,hogan,hoi,hokan,hold,holdup,hole,holly,holm,holst,holt,home,homo,honda,hondo,hone,honey,hong,honk,hooch,hood,hoof,hook,hookup,hoop,hoot,hop,hope,horde,horn,horny,horse,horus,hose,host,hot,hotbox,hotel,hough,hound,hour,house,hove,hovel,hover,how,howdy,howe,howl,hoy,hoyt,hp,hq,hr,hs,ht,hu,hub,hubbub,hubby,huber,huck,hue,hued,huff',
															_1: {
																ctor: '::',
																_0: 'hug,huge,hugh,hughes,hugo,huh,hulk,hull,hum,human,humid,hump,humus,hun,hunch,hung,hunk,hunt,hurd,hurl,huron,hurrah,hurry,hurst,hurt,hurty,hush,husky,hut,hutch,hv,hw,hx,hy,hyde,hydra,hydro,hyena,hying,hyman,hymen,hymn,hymnal,hz,i,i\'d,i\'ll,i\'m,i\'s,i\'ve,ia,iambic,ian,ib,ibex,ibid,ibis,ibm,ibn,ic,icc,ice,icing,icky,icon,icy,id,ida,idaho,idea,ideal,idiom,idiot,idle,idol,idyll,ie,ieee,if,iffy,ifni,ig,igloo,igor,ih,ii,iii,iiii,ij,ijk,ik,ike,il,ileum,iliac,iliad,ill,illume,ilona,im,image,imbue,imp,impel,import,impute,in,inane,inapt,inc,inca,incest,inch,incur,index,india,indies,indy,inept,inert,infect,infer,infima,infix,infra,ingot,inhere,injun,ink,inlay,inlet,inman,inn,inner,input,insect,inset,insult,intend,inter,into,inure,invoke,io,ion,ionic,iota,iowa,ip,ipso,iq,ir,ira,iran,iraq,irate,ire,irene,iris,irish,irk,irma,iron,irony,irs,irvin,irwin,is,isaac,isabel,ising,isis,islam,island,isle,isn\'t,israel,issue,it,it&t,it\'d,it\'ll,italy,itch,item,ito,itt,iu,iv,ivan,ive,ivory,ivy,iw,ix,iy,iz,j,j\'s,ja,jab,jack,jacky,jacm,jacob,jacobi,jade,jag,jail,jaime,jake,jam,james,jan,jane,janet',
																_1: {
																	ctor: '::',
																	_0: 'janos,janus,japan,jar,jason,java,jaw,jay,jazz,jazzy,jb,jc,jd,je,jean,jed,jeep,jeff,jejune,jelly,jenny,jeres,jerk,jerky,jerry,jersey,jess,jesse,jest,jesus,jet,jew,jewel,jewett,jewish,jf,jg,jh,ji,jibe,jiffy,jig,jill,jilt,jim,jimmy,jinx,jive,jj,jjj,jjjj,jk,jkl,jl,jm,jn,jo,joan,job,jock,jockey,joe,joel,joey,jog,john,johns,join,joint,joke,jolla,jolly,jolt,jon,jonas,jones,jorge,jose,josef,joshua,joss,jostle,jot,joule,joust,jove,jowl,jowly,joy,joyce,jp,jq,jr,js,jt,ju,juan,judas,judd,jude,judge,judo,judy,jug,juggle,juice,juicy,juju,juke,jukes,julep,jules,julia,julie,julio,july,jumbo,jump,jumpy,junco,june,junk,junky,juno,junta,jura,jure,juror,jury,just,jut,jute,jv,jw,jx,jy,jz,k,k\'s,ka,kabul,kafka,kahn,kajar,kale,kalmia,kane,kant,kapok,kappa,karate,karen,karl,karma,karol,karp,kate,kathy,katie,katz,kava,kay,kayo,kazoo,kb,kc,kd,ke,keats,keel,keen,keep,keg,keith,keller,kelly,kelp,kemp,ken,keno,kent,kenya,kepler,kept,kern,kerr,kerry,ketch,kevin,key,keyed,keyes,keys,kf,kg,kh,khaki,khan,khmer,ki,kick,kid,kidde,kidney,kiev,kigali,kill,kim,kin,kind,king,kink,kinky,kiosk,kiowa,kirby',
																	_1: {
																		ctor: '::',
																		_0: 'kirk,kirov,kiss,kit,kite,kitty,kiva,kivu,kiwi,kj,kk,kkk,kkkk,kl,klan,klaus,klein,kline,klm,klux,km,kn,knack,knapp,knauer,knead,knee,kneel,knelt,knew,knick,knife,knit,knob,knock,knoll,knot,knott,know,known,knox,knurl,ko,koala,koch,kodak,kola,kombu,kong,koran,korea,kp,kq,kr,kraft,krause,kraut,krebs,kruse,ks,kt,ku,kudo,kudzu,kuhn,kulak,kurd,kurt,kv,kw,kx,ky,kyle,kyoto,kz,l,l\'s,la,lab,laban,label,labia,labile,lac,lace,lack,lacy,lad,laden,ladle,lady,lag,lager,lagoon,lagos,laid,lain,lair,laity,lake,lam,lamar,lamb,lame,lamp,lana,lance,land,lane,lang,lange,lanka,lanky,lao,laos,lap,lapel,lapse,larch,lard,lares,large,lark,larkin,larry,lars,larva,lase,lash,lass,lasso,last,latch,late,later,latest,latex,lath,lathe,latin,latus,laud,laue,laugh,launch,laura,lava,law,lawn,lawson,lax,lay,layup,laze,lazy,lb,lc,ld,le,lea,leach,lead,leaf,leafy,leak,leaky,lean,leap,leapt,lear,learn,lease,leash,least,leave,led,ledge,lee,leech,leeds,leek,leer,leery,leeway,left,lefty,leg,legal,leggy,legion,leigh,leila,leland,lemma,lemon,len,lena,lend,lenin,lenny,lens,lent,leo,leon,leona,leone,leper,leroy,less,lessee,lest,let,lethe,lev,levee,level',
																		_1: {
																			ctor: '::',
																			_0: 'lever,levi,levin,levis,levy,lew,lewd,lewis,leyden,lf,lg,lh,li,liar,libel,libido,libya,lice,lick,lid,lie,lied,lien,lieu,life,lifo,lift,light,like,liken,lila,lilac,lilly,lilt,lily,lima,limb,limbo,lime,limit,limp,lin,lind,linda,linden,line,linen,lingo,link,lint,linus,lion,lip,lipid,lisa,lise,lisle,lisp,list,listen,lit,lithe,litton,live,liven,livid,livre,liz,lizzie,lj,lk,ll,lll,llll,lloyd,lm,lmn,ln,lo,load,loaf,loam,loamy,loan,loath,lob,lobar,lobby,lobe,lobo,local,loci,lock,locke,locus,lodge,loeb,loess,loft,lofty,log,logan,loge,logic,loin,loire,lois,loiter,loki,lola,loll,lolly,lomb,lome,lone,long,look,loom,loon,loop,loose,loot,lop,lope,lopez,lord,lore,loren,los,lose,loss,lossy,lost,lot,lotte,lotus,lou,loud,louis,louise,louse,lousy,louver,love,low,lowe,lower,lowry,loy,loyal,lp,lq,lr,ls,lsi,lt,ltv,lu,lucas,lucia,lucid,luck,lucky,lucre,lucy,lug,luge,luger,luis,luke,lull,lulu,lumbar,lumen,lump,lumpy,lunar,lunch,lund,lung,lunge,lura,lurch,lure,lurid,lurk,lush,lust,lusty,lute,lutz,lux,luxe,luzon,lv,lw,lx,ly,lydia,lye,lying,lykes,lyle,lyman,lymph,lynch,lynn,lynx,lyon,lyons,lyra,lyric,lz,m,m&m,m\'s',
																			_1: {
																				ctor: '::',
																				_0: 'ma,mabel,mac,mace,mach,macho,mack,mackey,macon,macro,mad,madam,made,madman,madsen,mae,magi,magic,magma,magna,magog,maid,maier,mail,maim,main,maine,major,make,malady,malay,male,mali,mall,malt,malta,mambo,mamma,mammal,man,mana,manama,mane,mange,mania,manic,mann,manna,manor,mans,manse,mantle,many,mao,maori,map,maple,mar,marc,march,marco,marcy,mardi,mare,margo,maria,marie,marin,marine,mario,mark,marks,marlin,marrow,marry,mars,marsh,mart,marty,marx,mary,maser,mash,mask,mason,masque,mass,mast,mat,match,mate,mateo,mater,math,matte,maul,mauve,mavis,maw,mawr,max,maxim,maxima,may,maya,maybe,mayer,mayhem,mayo,mayor,mayst,mazda,maze,mb,mba,mc,mccoy,mcgee,mckay,mckee,mcleod,md,me,mead,meal,mealy,mean,meant,meat,meaty,mecca,mecum,medal,medea,media,medic,medley,meek,meet,meg,mega,meier,meir,mel,meld,melee,mellow,melon,melt,memo,memoir,men,mend,menlo,menu,merck,mercy,mere,merge,merit,merle,merry,mesa,mescal,mesh,meson,mess,messy,met,metal,mete,meter,metro,mew,meyer,meyers,mezzo,mf,mg,mh,mi,miami,mica,mice,mickey,micky,micro,mid,midas,midge,midst,mien,miff,mig,might,mike,mila,milan,milch,mild,mildew,mile,miles,milk,milky,mill,mills,milt,mimi,mimic,mince,mind,mine,mini,minim,mink',
																				_1: {
																					ctor: '::',
																					_0: 'minnow,minor,minos,minot,minsk,mint,minus,mira,mirage,mire,mirth,miser,misery,miss,missy,mist,misty,mit,mite,mitre,mitt,mix,mixup,mizar,mj,mk,ml,mm,mmm,mmmm,mn,mno,mo,moan,moat,mob,mobil,mock,modal,mode,model,modem,modish,moe,moen,mohr,moire,moist,molal,molar,mold,mole,moll,mollie,molly,molt,molten,mommy,mona,monad,mondo,monel,money,monic,monk,mont,monte,month,monty,moo,mood,moody,moon,moor,moore,moose,moot,mop,moral,morale,moran,more,morel,morn,moron,morse,morsel,mort,mosaic,moser,moses,moss,mossy,most,mot,motel,motet,moth,mother,motif,motor,motto,mould,mound,mount,mourn,mouse,mousy,mouth,move,movie,mow,moyer,mp,mph,mq,mr,mrs,ms,mt,mu,much,muck,mucus,mud,mudd,muddy,muff,muffin,mug,muggy,mugho,muir,mulch,mulct,mule,mull,multi,mum,mummy,munch,mung,munson,muon,muong,mural,muriel,murk,murky,murre,muse,mush,mushy,music,musk,muslim,must,musty,mute,mutt,muzak,muzo,mv,mw,mx,my,myel,myers,mylar,mynah,myopia,myra,myron,myrrh,myself,myth,mz,n,n\'s,na,naacp,nab,nadir,nag,nagoya,nagy,naiad,nail,nair,naive,naked,name,nan,nancy,naomi,nap,nary,nasa,nasal,nash,nasty,nat,natal,nate,nato,natty,nature,naval,nave,navel,navy,nay,nazi,nb,nbc,nbs',
																					_1: {
																						ctor: '::',
																						_0: 'nc,ncaa,ncr,nd,ne,neal,near,neat,neath,neck,ned,nee,need,needy,neff,negate,negro,nehru,neil,nell,nelsen,neon,nepal,nero,nerve,ness,nest,net,neuron,neva,neve,new,newel,newt,next,nf,ng,nh,ni,nib,nibs,nice,nicety,niche,nick,niece,niger,nigh,night,nih,nikko,nil,nile,nimbus,nimh,nina,nine,ninth,niobe,nip,nit,nitric,nitty,nixon,nj,nk,nl,nm,nn,nnn,nnnn,no,noaa,noah,nob,nobel,noble,nod,nodal,node,noel,noise,noisy,nolan,noll,nolo,nomad,non,nonce,none,nook,noon,noose,nop,nor,nora,norm,norma,north,norway,nose,not,notch,note,notre,noun,nov,nova,novak,novel,novo,now,np,nq,nr,nrc,ns,nsf,nt,ntis,nu,nuance,nubia,nuclei,nude,nudge,null,numb,nun,nurse,nut,nv,nw,nx,ny,nyc,nylon,nymph,nyu,nz,o,o\'er,o\'s,oa,oaf,oak,oaken,oakley,oar,oases,oasis,oat,oath,ob,obese,obey,objet,oboe,oc,occur,ocean,oct,octal,octave,octet,od,odd,ode,odin,odium,oe,of,off,offal,offend,offer,oft,often,og,ogden,ogle,ogre,oh,ohio,ohm,ohmic,oi,oil,oily,oint,oj,ok,okay,ol,olaf,olav,old,olden,oldy,olga,olin,olive,olsen,olson,om,omaha,oman,omega,omen,omit,on,once,one,onion,only,onset',
																						_1: {
																							ctor: '::',
																							_0: 'onto,onus,onward,onyx,oo,ooo,oooo,ooze,op,opal,opec,opel,open,opera,opium,opt,optic,opus,oq,or,oral,orate,orb,orbit,orchid,ordain,order,ore,organ,orgy,orin,orion,ornery,orono,orr,os,osaka,oscar,osier,oslo,ot,other,otis,ott,otter,otto,ou,ouch,ought,ounce,our,oust,out,ouvre,ouzel,ouzo,ov,ova,oval,ovary,ovate,oven,over,overt,ovid,ow,owe,owens,owing,owl,owly,own,ox,oxen,oxeye,oxide,oxnard,oy,oz,ozark,ozone,p,p\'s,pa,pablo,pabst,pace,pack,packet,pact,pad,paddy,padre,paean,pagan,page,paid,pail,pain,paine,paint,pair,pal,pale,pall,palm,palo,palsy,pam,pampa,pan,panama,panda,pane,panel,pang,panic,pansy,pant,panty,paoli,pap,papa,papal,papaw,paper,pappy,papua,par,parch,pardon,pare,pareto,paris,park,parke,parks,parr,parry,parse,part,party,pascal,pasha,paso,pass,passe,past,paste,pasty,pat,patch,pate,pater,path,patio,patsy,patti,patton,patty,paul,paula,pauli,paulo,pause,pave,paw,pawn,pax,pay,payday,payne,paz,pb,pbs,pc,pd,pe,pea,peace,peach,peak,peaky,peal,peale,pear,pearl,pease,peat,pebble,pecan,peck,pecos,pedal,pedro,pee,peed,peek,peel,peep,peepy,peer,peg,peggy,pelt,pen,penal,pence,pencil,pend,penh,penn,penna,penny,pent,peony',
																							_1: {
																								ctor: '::',
																								_0: 'pep,peppy,pepsi,per,perch,percy,perez,peril,perk,perky,perle,perry,persia,pert,perth,peru,peruse,pest,peste,pet,petal,pete,peter,petit,petri,petty,pew,pewee,pf,pg,ph,ph.d,phage,phase,phd,phenol,phi,phil,phlox,phon,phone,phony,photo,phyla,physic,pi,piano,pica,pick,pickup,picky,pie,piece,pier,pierce,piety,pig,piggy,pike,pile,pill,pilot,pimp,pin,pinch,pine,ping,pinion,pink,pint,pinto,pion,piotr,pious,pip,pipe,piper,pique,pit,pitch,pith,pithy,pitney,pitt,pity,pius,pivot,pixel,pixy,pizza,pj,pk,pl,place,plague,plaid,plain,plan,plane,plank,plant,plasm,plat,plate,plato,play,playa,plaza,plea,plead,pleat,pledge,pliny,plod,plop,plot,plow,pluck,plug,plum,plumb,plume,plump,plunk,plus,plush,plushy,pluto,ply,pm,pn,po,poach,pobox,pod,podge,podia,poe,poem,poesy,poet,poetry,pogo,poi,point,poise,poke,pol,polar,pole,police,polio,polis,polk,polka,poll,polo,pomona,pomp,ponce,pond,pong,pont,pony,pooch,pooh,pool,poole,poop,poor,pop,pope,poppy,porch,pore,pork,porous,port,porte,portia,porto,pose,posey,posh,posit,posse,post,posy,pot,potts,pouch,pound,pour,pout,pow,powder,power,pp,ppm,ppp,pppp,pq,pqr,pr,prado,pram,prank,pratt,pray,preen,prefix,prep,press,prexy,prey,priam',
																								_1: {
																									ctor: '::',
																									_0: 'price,prick,pride,prig,prim,prima,prime,primp,prince,print,prior,prism,prissy,privy,prize,pro,probe,prod,prof,prom,prone,prong,proof,prop,propyl,prose,proud,prove,prow,prowl,proxy,prune,pry,ps,psalm,psi,psych,pt,pta,pu,pub,puck,puddly,puerto,puff,puffy,pug,pugh,puke,pull,pulp,pulse,puma,pump,pun,punch,punic,punish,punk,punky,punt,puny,pup,pupal,pupil,puppy,pure,purge,purl,purr,purse,pus,pusan,pusey,push,pussy,put,putt,putty,pv,pvc,pw,px,py,pygmy,pyle,pyre,pyrex,pyrite,pz,q,q\'s,qa,qatar,qb,qc,qd,qe,qed,qf,qg,qh,qi,qj,qk,ql,qm,qn,qo,qp,qq,qqq,qqqq,qr,qrs,qs,qt,qu,qua,quack,quad,quaff,quail,quake,qualm,quark,quarry,quart,quash,quasi,quay,queasy,queen,queer,quell,query,quest,queue,quick,quid,quiet,quill,quilt,quinn,quint,quip,quirk,quirt,quit,quite,quito,quiz,quo,quod,quota,quote,qv,qw,qx,qy,qz,r,r&d,r\'s,ra,rabat,rabbi,rabbit,rabid,rabin,race,rack,racy,radar,radii,radio,radium,radix,radon,rae,rafael,raft,rag,rage,raid,rail,rain,rainy,raise,raj,rajah,rake,rally,ralph,ram,raman,ramo,ramp,ramsey,ran,ranch,rand,randy,rang,range,rangy,rank,rant,raoul,rap,rape,rapid,rapt,rare,rasa,rascal',
																									_1: {
																										ctor: '::',
																										_0: 'rash,rasp,rat,rata,rate,rater,ratio,rattle,raul,rave,ravel,raven,raw,ray,raze,razor,rb,rc,rca,rd,re,reach,read,ready,reagan,real,realm,ream,reap,rear,reave,reb,rebel,rebut,recipe,reck,recur,red,redeem,reduce,reed,reedy,reef,reek,reel,reese,reeve,refer,regal,regina,regis,reich,reid,reign,rein,relax,relay,relic,reman,remedy,remit,remus,rena,renal,rend,rene,renown,rent,rep,repel,repent,resin,resort,rest,ret,retch,return,reub,rev,reveal,revel,rever,revet,revved,rex,rf,rg,rh,rhea,rheum,rhine,rhino,rho,rhoda,rhode,rhyme,ri,rib,rica,rice,rich,rick,rico,rid,ride,ridge,rifle,rift,rig,riga,rigel,riggs,right,rigid,riley,rill,rilly,rim,rime,rimy,ring,rink,rinse,rio,riot,rip,ripe,ripen,ripley,rise,risen,risk,risky,rite,ritz,rival,riven,river,rivet,riyadh,rj,rk,rl,rm,rn,ro,roach,road,roam,roar,roast,rob,robe,robin,robot,rock,rocket,rocky,rod,rode,rodeo,roe,roger,rogue,roil,role,roll,roman,rome,romeo,romp,ron,rondo,rood,roof,rook,rookie,rooky,room,roomy,roost,root,rope,rosa,rose,rosen,ross,rosy,rot,rotc,roth,rotor,rouge,rough,round,rouse,rout,route,rove,row,rowdy,rowe,roy,royal,royce,rp,rpm,rq,rr,rrr,rrrr,rs,rst,rsvp,rt,ru',
																										_1: {
																											ctor: '::',
																											_0: 'ruanda,rub,rube,ruben,rubin,rubric,ruby,ruddy,rude,rudy,rue,rufus,rug,ruin,rule,rum,rumen,rummy,rump,rumpus,run,rune,rung,runge,runic,runt,runty,rupee,rural,ruse,rush,rusk,russ,russo,rust,rusty,rut,ruth,rutty,rv,rw,rx,ry,ryan,ryder,rye,rz,s,s\'s,sa,sabine,sable,sabra,sac,sachs,sack,sad,saddle,sadie,safari,safe,sag,saga,sage,sago,said,sail,saint,sake,sal,salad,sale,salem,saline,salk,salle,sally,salon,salt,salty,salve,salvo,sam,samba,same,sammy,samoa,samuel,san,sana,sand,sandal,sandy,sane,sang,sank,sans,santa,santo,sao,sap,sappy,sara,sarah,saran,sari,sash,sat,satan,satin,satyr,sauce,saucy,saud,saudi,saul,sault,saute,save,savoy,savvy,saw,sawyer,sax,saxon,say,sb,sc,scab,scala,scald,scale,scalp,scam,scamp,scan,scant,scar,scare,scarf,scary,scat,scaup,scene,scent,school,scion,scm,scoff,scold,scoop,scoot,scope,scops,score,scoria,scorn,scot,scott,scour,scout,scowl,scram,scrap,scrape,screw,scrim,scrub,scuba,scud,scuff,scull,scum,scurry,sd,se,sea,seal,seam,seamy,sean,sear,sears,season,seat,sec,secant,sect,sedan,seder,sedge,see,seed,seedy,seek,seem,seen,seep,seethe,seize,self,sell,selma,semi,sen,send,seneca,senor,sense,sent,sentry,seoul,sepal,sepia,sepoy,sept',
																											_1: {
																												ctor: '::',
																												_0: 'septa,sequin,sera,serf,serge,serif,serum,serve,servo,set,seth,seton,setup,seven,sever,severe,sew,sewn,sex,sexy,sf,sg,sh,shack,shad,shade,shady,shafer,shaft,shag,shah,shake,shaken,shako,shaky,shale,shall,sham,shame,shank,shape,shard,share,shari,shark,sharp,shave,shaw,shawl,shay,she,she\'d,shea,sheaf,shear,sheath,shed,sheen,sheep,sheer,sheet,sheik,shelf,shell,shied,shift,shill,shim,shin,shine,shinto,shiny,ship,shire,shirk,shirt,shish,shiv,shoal,shock,shod,shoe,shoji,shone,shoo,shook,shoot,shop,shore,short,shot,shout,shove,show,shown,showy,shrank,shred,shrew,shrike,shrub,shrug,shu,shuck,shun,shunt,shut,shy,si,sial,siam,sian,sib,sibley,sibyl,sic,sick,side,sidle,siege,siena,sieve,sift,sigh,sight,sigma,sign,signal,signor,silas,silk,silky,sill,silly,silo,silt,silty,sima,simon,simons,sims,sin,sinai,since,sine,sinew,sing,singe,sinh,sink,sinus,sioux,sip,sir,sire,siren,sis,sisal,sit,site,situ,situs,siva,six,sixgun,sixth,sixty,size,sj,sk,skat,skate,skeet,skew,ski,skid,skied,skiff,skill,skim,skimp,skimpy,skin,skip,skirt,skit,skulk,skull,skunk,sky,skye,sl,slab,slack,slag,slain,slake,slam,slang,slant,slap,slash,slat,slate,slater,slav,slave,slay,sled,sleek,sleep,sleet,slept,slew,slice,slick',
																												_1: {
																													ctor: '::',
																													_0: 'slid,slide,slim,slime,slimy,sling,slip,slit,sliver,sloan,slob,sloe,slog,sloop,slop,slope,slosh,slot,sloth,slow,slug,sluice,slum,slump,slung,slur,slurp,sly,sm,smack,small,smart,smash,smear,smell,smelt,smile,smirk,smith,smithy,smog,smoke,smoky,smug,smut,sn,snack,snafu,snag,snail,snake,snap,snare,snark,snarl,snatch,sneak,sneer,snell,snick,sniff,snip,snipe,snob,snook,snoop,snore,snort,snout,snow,snowy,snub,snuff,snug,so,soak,soap,soapy,soar,sob,sober,social,sock,sod,soda,sofa,sofia,soft,soften,soggy,soil,sol,solar,sold,sole,solemn,solid,solo,solon,solve,soma,somal,some,son,sonar,song,sonic,sonny,sonora,sony,soon,soot,sooth,sop,sora,sorb,sore,sorry,sort,sos,sou,sough,soul,sound,soup,sour,source,sousa,south,sow,sown,soy,soya,sp,spa,space,spade,spain,span,spar,spare,sparge,spark,spasm,spat,spate,spawn,spay,speak,spear,spec,speck,sped,speed,spell,spend,spent,sperm,sperry,spew,spica,spice,spicy,spike,spiky,spill,spilt,spin,spine,spiny,spire,spiro,spit,spite,spitz,splat,splay,spline,split,spoil,spoke,spoof,spook,spooky,spool,spoon,spore,sport,spot,spout,sprain,spray,spree,sprig,spruce,sprue,spud,spume,spun,spunk,spur,spurn,spurt,spy,sq,squad,squat,squaw,squibb,squid,squint,sr,sri,ss,sss,ssss',
																													_1: {
																														ctor: '::',
																														_0: 'sst,st,st.,stab,stack,stacy,staff,stag,stage,stagy,stahl,staid,stain,stair,stake,stale,stalk,stall,stamp,stan,stance,stand,stank,staph,star,stare,stark,starr,start,stash,state,statue,stave,stay,stead,steak,steal,steam,steed,steel,steele,steen,steep,steer,stein,stella,stem,step,stern,steve,stew,stick,stiff,stile,still,stilt,sting,stingy,stink,stint,stir,stock,stoic,stoke,stole,stomp,stone,stony,stood,stool,stoop,stop,store,storey,stork,storm,story,stout,stove,stow,strafe,strap,straw,stray,strewn,strip,stroll,strom,strop,strum,strut,stu,stuart,stub,stuck,stud,study,stuff,stuffy,stump,stun,stung,stunk,stunt,sturm,style,styli,styx,su,suave,sub,subtly,such,suck,sud,sudan,suds,sue,suey,suez,sugar,suit,suite,sulfa,sulk,sulky,sully,sultry,sum,sumac,summon,sun,sung,sunk,sunny,sunset,suny,sup,super,supra,sure,surf,surge,sus,susan,sushi,susie,sutton,sv,sw,swab,swag,swain,swam,swami,swamp,swampy,swan,swank,swap,swarm,swart,swat,swath,sway,swear,sweat,sweaty,swede,sweep,sweet,swell,swelt,swept,swift,swig,swim,swine,swing,swipe,swirl,swish,swiss,swoop,sword,swore,sworn,swum,swung,sx,sy,sybil,sykes,sylow,sylvan,synge,synod,syria,syrup,sz,t,t\'s,ta,tab,table,taboo,tabu,tabula,tacit,tack,tacky,tacoma,tact,tad,taffy,taft',
																														_1: {
																															ctor: '::',
																															_0: 'tag,tahoe,tail,taint,take,taken,talc,tale,talk,talky,tall,tallow,tally,talon,talus,tam,tame,tamp,tampa,tan,tang,tango,tangy,tanh,tank,tansy,tanya,tao,taos,tap,tapa,tape,taper,tapir,tapis,tappa,tar,tara,tardy,tariff,tarry,tart,task,tass,taste,tasty,tat,tate,tater,tattle,tatty,tau,taunt,taut,tavern,tawny,tax,taxi,tb,tc,td,te,tea,teach,teal,team,tear,tease,teat,tech,tecum,ted,teddy,tee,teem,teen,teensy,teet,teeth,telex,tell,tempo,tempt,ten,tend,tenet,tenney,tenon,tenor,tense,tensor,tent,tenth,tepee,tepid,term,tern,terra,terre,terry,terse,tess,test,testy,tete,texan,texas,text,tf,tg,th,thai,than,thank,that,thaw,the,thea,thee,theft,their,them,theme,then,there,these,theta,they,thick,thief,thigh,thin,thine,thing,think,third,this,thong,thor,thorn,thorny,those,thou,thread,three,threw,throb,throes,throw,thrum,thud,thug,thule,thumb,thump,thus,thy,thyme,ti,tiber,tibet,tibia,tic,tick,ticket,tid,tidal,tidbit,tide,tidy,tie,tied,tier,tift,tiger,tight,til,tilde,tile,till,tilt,tilth,tim,time,timex,timid,timon,tin,tina,tine,tinge,tint,tiny,tioga,tip,tipoff,tippy,tipsy,tire,tit,titan,tithe,title,titus,tj,tk,tl,tm,tn,tnt,to,toad,toady,toast,toby,today',
																															_1: {
																																ctor: '::',
																																_0: 'todd,toe,tofu,tog,togo,togs,toil,toilet,token,tokyo,told,toll,tom,tomb,tome,tommy,ton,tonal,tone,tong,toni,tonic,tonk,tonsil,tony,too,took,tool,toot,tooth,top,topaz,topic,topple,topsy,tor,torah,torch,tore,tori,torn,torr,torso,tort,torus,tory,toss,tot,total,tote,totem,touch,tough,tour,tout,tow,towel,tower,town,toxic,toxin,toy,tp,tq,tr,trace,track,tract,tracy,trade,trag,trail,train,trait,tram,tramp,trap,trash,trawl,tray,tread,treat,treble,tree,trek,trench,trend,tress,triad,trial,tribe,trick,tried,trig,trill,trim,trio,trip,tripe,trite,triton,trod,troll,troop,trot,trout,troy,truce,truck,trudge,trudy,true,truly,trump,trunk,truss,trust,truth,trw,try,ts,tsar,tt,ttl,ttt,tttt,tty,tu,tub,tuba,tube,tuck,tudor,tuff,tuft,tug,tulane,tulip,tulle,tulsa,tum,tun,tuna,tune,tung,tunic,tunis,tunnel,tuple,turf,turin,turk,turn,turvy,tusk,tussle,tutor,tutu,tuv,tv,tva,tw,twa,twain,tweak,tweed,twice,twig,twill,twin,twine,twirl,twist,twisty,twit,two,twx,tx,ty,tyburn,tying,tyler,type,typic,typo,tyson,tz,u,u\'s,ua,ub,uc,ucla,ud,ue,uf,ug,ugh,ugly,uh,ui,uj,uk,ul,ulan,ulcer,ultra,um,umber,umbra,umpire,un,unary,uncle,under,unify',
																																_1: {
																																	ctor: '::',
																																	_0: 'union,unit,unite,unity,unix,until,uo,up,upend,uphold,upon,upper,uproar,upset,uptake,upton,uq,ur,urban,urbane,urea,urge,uri,urine,uris,urn,ursa,us,usa,usaf,usage,usc,usda,use,useful,usgs,usher,usia,usn,usps,ussr,usual,usurp,usury,ut,utah,utica,utile,utmost,utter,uu,uuu,uuuu,uv,uvw,uw,ux,uy,uz,v,v\'s,va,vacua,vacuo,vade,vaduz,vague,vail,vain,vale,valet,valeur,valid,value,valve,vamp,van,vance,vane,vary,vase,vast,vat,vault,vb,vc,vd,ve,veal,veda,vee,veer,veery,vega,veil,vein,velar,veldt,vella,vellum,venal,vend,venial,venom,vent,venus,vera,verb,verde,verdi,verge,verity,verna,verne,versa,verse,verve,very,vessel,vest,vet,vetch,veto,vex,vf,vg,vh,vi,via,vial,vicar,vice,vichy,vicky,vida,video,vie,viet,view,vigil,vii,viii,vile,villa,vine,vinyl,viola,violet,virgil,virgo,virus,vis,visa,vise,visit,visor,vista,vita,vitae,vital,vito,vitro,viva,vivian,vivid,vivo,vixen,viz,vj,vk,vl,vm,vn,vo,vocal,vogel,vogue,voice,void,volt,volta,volvo,vomit,von,voss,vote,vouch,vow,vowel,vp,vq,vr,vs,vt,vu,vulcan,vv,vvv,vvvv,vw,vx,vy,vying,vz,w,w\'s,wa,waals,wac,wack,wacke,wacky,waco,wad',
																																	_1: {
																																		ctor: '::',
																																		_0: 'wade,wadi,wafer,wag,wage,waggle,wah,wahl,wail,waist,wait,waite,waive,wake,waken,waldo,wale,walk,walkie,wall,walls,wally,walsh,walt,walton,waltz,wan,wand,wane,wang,want,war,ward,ware,warm,warmth,warn,warp,warren,wart,warty,wary,was,wash,washy,wasp,wast,waste,watch,water,watt,watts,wave,wavy,wax,waxen,waxy,way,wayne,wb,wc,wd,we,we\'d,we\'ll,we\'re,we\'ve,weak,weal,wealth,wean,wear,weary,weave,web,webb,weber,weco,wed,wedge,wee,weed,weedy,week,weeks,weep,wehr,wei,weigh,weir,weird,weiss,welch,weld,well,wells,welsh,welt,wendy,went,wept,were,wert,west,wet,wf,wg,wh,whack,whale,wham,wharf',
																																		_1: {
																																			ctor: '::',
																																			_0: 'what,wheat,whee,wheel,whelk,whelm,whelp,when,where,whet,which,whiff,whig,while,whim,whine,whinny,whip,whir,whirl,whisk,whit,white,whiz,who,who\'d,whoa,whole,whom,whoop,whoosh,whop,whose,whup,why,wi,wick,wide,widen,widow,width,wield,wier,wife,wig,wild,wile,wiley,wilkes,will,willa,wills,wilma,wilt,wily,win,wince,winch,wind,windy,wine,wing,wink,winnie,wino,winter,winy,wipe,wire,wiry,wise,wish,wishy,wisp,wispy,wit,witch,with,withe,withy,witt,witty,wive,wj,wk,wl,wm,wn,wo,woe,wok,woke,wold,wolf,wolfe,wolff,wolve,woman,womb,women,won,won\'t,wonder,wong,wont,woo,wood,woods,woody,wool,woozy,word,wordy,wore,work,world,worm,wormy,worn,worry,worse,worst,worth,wotan,would,wound,wove,woven,wow,wp,wq,wr,wrack,wrap,wrath,wreak,wreck,wrest,wring,wrist,writ,write,writhe,wrong,wrote,wry,ws,wt,wu,wuhan,wv,ww,www,wwww,wx,wxy,wy,wyatt,wyeth,wylie,wyman,wyner,wynn,wz,x,x\'s,xa,xb,xc,xd,xe,xenon,xerox,xf,xg,xh,xi,xj,xk,xl,xm,xn,xo,xp,xq,xr,xs,xt,xu,xv,xw,xx,xxx,xxxx,xy,xylem,xyz,xz,y,y\'s,ya,yacht,yah,yak,yale,yalta,yam,yamaha,yang,yank,yap,yaqui',
																																			_1: {
																																				ctor: '::',
																																				_0: 'yard,yarn,yates,yaw,yawl,yawn,yb,yc,yd,ye,yea,yeah,year,yearn,yeast,yeasty,yeats,yell,yelp,yemen,yen,yet,yf,yg,yh,yi,yield,yin,yip,yj,yk,yl,ym,ymca,yn,yo,yodel,yoder,yoga,yogi,yoke,yokel,yolk,yon,yond,yore,york,yost,you,you\'d,young,your,youth,yow,yp,yq,yr,ys,yt,yu,yucca,yuck,yuh,yuki,yukon,yule,yv,yves,yw,ywca,yx,yy,yyy,yyyy,yz,z,z\'s,za,zag,zaire,zan,zap,zazen,zb,zc,zd,ze,zeal,zealot,zebra,zeiss,zen,zero,zest,zesty,zeta,zeus,zf,zg,zh,zi,zig,zilch,zinc,zing,zion,zip,zj,zk,zl,zloty,zm,zn,zo,zoe,zomba,zone,zoo,zoom,zorn,zp,zq,zr,zs,zt,zu,zurich,zv,zw,zx,zy,zz,zzz,zzzz,0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78',
																																				_1: {
																																					ctor: '::',
																																					_0: '79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,111,123,200,222,234,300,333,345,400,444,456,500,555,567,600,666,678,700,777,789,800,888,900,999,1000,1111,1234,1492,1500,1600,1700,1776,1800,1812,1900,1910,1920,1925,1930,1935,1940,1945,1950,1955,1960,1965,1970,1975,1980,1985,1990,1991,1992,1993,1994,1995,1996,1997,2000,2001,2020,2222,2345,2468,3000,3333,3456,4000,4321,4444,4567,5000,5555,5678,6000,6666,6789,7000,7777,8000,8888,9000,9876,9999,100th,101st,10th,11th,12th,13th,14th,15th,16th,17th,18th,19th,1st,20th,21st,22nd,23rd,24th,25th,26th,27th,28th,29th,2nd,30th,31st,32nd,33rd,34th,35th,36th,37th,38th,39th,3rd,40th,41st,42nd,43rd,44th,45th,46th,47th,48th,49th,4th,50th,51st,52nd,53rd,54th,55th,56th,57th,58th,59th,5th,60th,61st,62nd,63rd,65th,66th,67th,68th,69th,6th,70th,71st,72nd,73rd,74th,75th,76th,77th,78th,79th,7th,80th,81st,82nd,83rd,84th,85th,86th,87th,88th,89th,8th,90th,91st,92nd,93rd,94th,95th,96th,97th,98th,99th,9th,!,!!,\",#,##,$,$$,%,%%,&,(,(),),*,**,+,-,:,;,=,?,??,@',
																																					_1: {ctor: '[]'}
																																				}
																																			}
																																		}
																																	}
																																}
																															}
																														}
																													}
																												}
																											}
																										}
																									}
																								}
																							}
																						}
																					}
																				}
																			}
																		}
																	}
																}
															}
														}
													}
												}
											}
										}
									}
								}
							}
						}
					}
				}
			}
		}
	}
};
var _billstclair$elm_dev_random$DicewareStrings$array = _elm_lang$core$Array$fromList(_billstclair$elm_dev_random$DicewareStrings$dicewareStrings);

var Elm = {};
Elm['DicewareStrings'] = Elm['DicewareStrings'] || {};
if (typeof _billstclair$elm_dev_random$DicewareStrings$main !== 'undefined') {
    _billstclair$elm_dev_random$DicewareStrings$main(Elm['DicewareStrings'], 'DicewareStrings', undefined);
}

if (typeof define === "function" && define['amd'])
{
  define([], function() { return Elm; });
  return;
}

if (typeof module === "object")
{
  module['exports'] = Elm;
  return;
}

var globalElm = this['Elm'];
if (typeof globalElm === "undefined")
{
  this['Elm'] = Elm;
  return;
}

for (var publicModule in Elm)
{
  if (publicModule in globalElm)
  {
    throw new Error('There are two Elm modules called `' + publicModule + '` on this page! Rename one of them.');
  }
  globalElm[publicModule] = Elm[publicModule];
}

}).call(this);

