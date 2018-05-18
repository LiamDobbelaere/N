const brain = require('brain.js');
/*
//provide optional config object (or undefined). Defaults shown.
var config = {
  binaryThresh: 0.5,     // ¯\_(ツ)_/¯
  hiddenLayers: [3],     // array of ints for the sizes of the hidden layers in the network
  activation: 'sigmoid' // Supported activation types ['sigmoid', 'relu', 'leaky-relu', 'tanh']
}
//create a simple feed forward neural network with backpropagation
var net = new brain.NeuralNetwork();

net.train([{input: "yes", output: "no"}]);

var output = net.run("yes");  // [0.987]
console.log(output);*/

var net = new brain.recurrent.LSTM();

net.train([
  { input: 'I feel great about the world!', output: {happy: 1} },
  { input: 'The world is a terrible place!', output: {sad: 1} },
]);
var output = net.run('I feel great about'); // sample log: {happy: 0.75, sad: 0.25}
console.log(output);