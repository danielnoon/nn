import { collection } from "./data/collection.ts";
import { load_csv } from "./data/load_csv.ts";
import { layer } from "./network/layer.ts";
import { loss, network, train } from "./network/network.ts";
import { collapse } from "./tools/collapse.ts";
import { round } from "./tools/round.ts";

// Load the iris dataset.
// I've modified the csv we used in class to include
// a header so we don't have to specify it here
const data = load_csv("datasets/iris.data", {
  y: 4,
});

// Print the first item in the collection

// data.head(1).print();

// First, onehot the collection on the species column.
// Then, slice the collection into training and testing sets.
const [training, testing] = data.onehot("Species").slice(0.2);

// Print the first item in the training set.
// Notice that the "Species" label has been separated into
// three columns. Additionally, the row will likely be different since
// slice shuffles the data by default.

// training.head(1).print();

// Create the neural network.
// This setup uses 4 inputs (petal and sepal length and width)
// We use sum of squared error as our loss function
//      (crossentropy would be better but my implementation is broken haha)
// There is one hidden layer with three nodes and relu activation.
// The output layer has 3 nodes (one for each Species) and uses softmax activation.
const model = network(4, "sse", layer(3, "relu"), layer(3, "softmax"));

// Let's train the network!
// The train function returns a list of the loss after each epoch
// which is very useful for graphing!
// We'll also time how long it takes to finish the training.
console.log("Training...");

const start = Date.now();

let history = train(model, training, {
  alpha: 0.005,
  max_epochs: 100000,
  target_loss: 0.005,
  // print_epochs: 100, // uncomment this to print the loss every 100 epochs
});

// Uncomment this line to save the loss history to a file.
// Deno.writeTextFile("./loss.txt", history.join("\n"));

const end = Date.now();

console.log(`Training finished! Took ${(end - start) / 1000}s`);

// Print out the loss for both the training and test sets.
// The loss function implicitly uses the loss function specified
// when the network was created (sse in this case).
console.log("\n=======================================\n");
console.log("Training loss: ", loss(model, training));
console.log("Test loss: ", loss(model, testing));

// Helper to get the flower name from network output.
function getFlowerType(c: number[]) {
  return ["setosa", "versicolor", "virginica"][collapse(c)];
}

// Create a collection for analyzing the output of the model.

const results = testing.map((entry) => {
  const out = model.predict(entry.x).map((o) => round(o, 2));
  const predicted = getFlowerType(out);
  const expected = getFlowerType(entry.y);
  const error = model.error(entry);
  return [expected === predicted, expected, predicted, round(error, 2), ...out];
});

const labels = [
  "Correct",
  "Expected",
  "Predicted",
  "Error",
  "Setosa",
  "Versicolor",
  "Virginica",
];

const outputs = collection(results, labels);

// Grab and print any erroneous predictions, sorted by
// worst error first.
const misclassified = outputs
  .subset({ rows: (row) => row.getY("Correct") === 0 })
  .sort("Error", "desc");

misclassified.print();

// Print the proportion of misclassified entries.
const pct = Math.round((misclassified.length / outputs.length) * 1000) / 10;
console.log(`Misclassifications: ${pct}%`);
