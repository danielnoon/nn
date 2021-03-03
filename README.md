# Neural Networks

My foray into multi-layer perceptrons and backpropagation.

This library consists of two modules:

- Custom data processing
- MLP neural network with several activation and loss functions

As of right now, to run this code you need [Deno](deno.land).
To execute the example iris program, install deno and type in your terminal

```shell
$ deno run --allow-read iris.ts
```

Pull requests are encouraged!

## Custom Data Processing

In order to feed the neural networks data easily, I developed
a data processing module. The most important data type introduced
in this module is the `collection`. Very similar to dataframes in
Pandas or R, collections are 2-dimensional data structures with
labeled columns and enumerated rows. However, collections associate
columns with input vs. output.

For example, in the Iris dataset, the sepal and petal widths and heights
would be input (x) columns, but the species column would be the output (y)
column.

The `collection` data type has a declarative, chain-method style API. All
transformations are non-mutating (i.e. the original collection is not changed).
While you could edit the collection manually, this is discouraged, and all
transformations should be made with the API.

The significance of this design decision is that you can chain transformations
together into a pipeline. For example:

```typescript
let transformed = data
  .subset({
    rows: (row) => row.getX("Petal Width") <= 1.5,
  })
  .sort("Sepal Length", "desc");

transformed.print();
```

Alternatively, you may import and use transformations
individually in a functional style. The API is the same,
but the first parameter is the collection.

```typescript
let prepared = onehot(transformed, "Species");
```

### The API

#### Creating a collection

Right now, there are two ways to create a collection: manually or using `load_csv` function.

##### Creating Manually

Import and use the `collection` constructor function with parameters:

- data: 2-dimensional array of data. Data may be numbers, strings, or booleans.
  - Output must come first
  - Strings and booleans will be converted into numbers as classifications.
  - Future support for text embeddings could happen. Stay tuned.
- labels: list of strings corresponding index-wise to the data rows
- y: (optional) number of outputs

**Example**:

```typescript
let or = collection(
  [
    [0, 0, 0],
    [1, 0, 1],
    [1, 1, 0],
    [1, 1, 1],
  ],
  ["Y", "X1", "X2"]
);
```

##### Using `load_csv`

**Parameters**:

- y: index of the output column or `"last"`
- labels: (optional) either `"infer"` or a list of labels
  - default: `"infer"`

```typescript
let iris = load_csv("datasets/iris.data", {
  y: 4,
  labels: "infer",
});
```

#### Methods

##### `Collection#print()`

Prints the collection as a table to the console.

##### `Collection#head(n)`

**Parameters**:

- n: `number`

**Returns** Collection with only the first `n` elements.

##### `Collection#slice(p, shuffle?)`

**Parameters**

- p: `number` percentage of collection items to separate into testing
- shuffle: `boolean` whether or not to shuffle the collection before splitting
  - optional, default `true`

**Returns** Tuple of two collections: `[training, testing]`

##### `Collection#onehot(column)`

**Parameters**

- column: `string`

**Returns** Collection with the column `column` expanded into one-hot form.

##### `Collection#sort(column, direction)`

**Parameters**

- column: `string`
- direction: `"asc"` or `"desc"`

**Returns** Collection with the rows sorted in ascending or descending order by specified column.

##### `Collection#subset(options)`

This is a rather special transformation, so it deserves a more nuanced explanation.

`options` is an object that can contain 3 properties: `x_columns`, `y_columns`, and `rows`. If any property is excluded, nothing will change for that property. Any or all of the properties may be subset at the same time.

The `_columns` properties can be either an array of strings, i.e. `["Petal Width", "Petal Length"]` or any iterable of numbers, i.e. `[1, 3, 5]` or `range(1, 6, 2)`. The resulting collection will contain _only_ the specified columns.

```typescript
prepared.subset({
  x_columns: ["Petal Length", "Petal Width"],
  y_columns: range(0, 2, 1), // equivalent to [0, 2]
});
```

The `rows` property is similar. You may index rows using an iterable of numbers to select specific indices. So you could say `range(0, 100, 2)` to select every other row of the first 100 rows. The other option is to use a function that accepts a row and returns either `true` or `false` for whether or not to keep that row. I showed this off earlier in the document, but here is another example:

```typescript
data.subset({
  rows: (row) => row.getX("Petal Length") > 5,
});
```

## Neural Network

### Making a Model

Creating a neural network model is simple:

The function `network` takes two arguments plus a list layer generators. The first two arguments are:

- input size
- loss function

A list generator is created with the `layer` constructor function. This function takes two things as well:

- number of nodes
- activation function

Here is an example of what this looks like for the iris dataset:

```typescript
let model = network(4, "sse", layer(3, "relu"), layer(3, "softmax"));
```

The available loss functions are

- sse
- crossentropy _(broken)_

And the available activation functions are

- step
- linear
- sigmoid
- relu
- softmax

### Training the Model

Just call the `train` function with the network model, data collection, and an options object. The options object can contain

- alpha: `number` the learning rate. Smaller values train slower but could be more accurate.
- max_epochs: `number` the maximum number of training epochs to execute
- target_loss: `number` stop training after loss crosses below this threshold
- print_epochs: `number` (optional) when this property is defined, print the loss every `n` epochs.

You may omit _either_ max_epochs or target_loss, but at least one must be specified. In most cases, both should be used to make sure training doesn't enter an infinite loop.

```typescript
const history = train(model, data, {
  alpha: 0.005,
  max_epochs: 10000,
  target_loss: 0.005,
});
```

The `train` function returns the history of losses; that is, the loss after every epoch.
