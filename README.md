# TaxGraphs

TaxGraphs is a web app that graphs marginal and effective tax rates against income for each US state. Graphs include a comparison between overall state tax rates and a detailed breakdown of each state's tax rate into its individual components. The app currently supports showing graphs for the single and married jointly filing statuses, as well as adjusting income by the standard deduction or itemized deduction.  

Tax data is collected from each state's official website and the [Tax Foundation](http://taxfoundation.org/article/state-individual-income-tax-rates). For the tech stack, the app uses AngularJS and D3.js to display the visualization, and it uses Browserify and LESS for asset compilation.

Setup
---
To run the app locally, install [Node.js](http://nodejs.org/download/) and then execute the following from the project directory:
```
npm install -g grunt-cli
npm install
```
Executing `grunt` will set up `grunt-watch` to monitor changes and compile the static assets and tax data. It will also host the app locally at `localhost:1337` with livereload enabled.

Executing `grunt dist` will prepare the app for distribution with concatenated and minified assets.

The Grunt tasks and build process originate from the [Sails.js](http://sailsjs.org/) new project scaffold.

Data
---
The tax data is in the `data/` folder and is broken down into individual JSON files for federal and each state's tax rates. The `json-bake` task concatenates all the JSON files together, and a custom Grunt task then preproceses the tax data and minfies the final JSON.

The `rate` property for each tax can be one of the following types:
- Number: A flat tax rate.
- Array: A set of marginal tax brackets.
- Object: Sets of marginal tax brackets for different filing statuses.

Each marginal tax bracket has the following structure: 
```
[
  Bracket income minimum,
  Bracket marginal tax rate,
  Total tax at the bracket income maxmium
]
```
The following is an example:
```
"income": {
  "rate": {
    "single": [
      [0, 0.1, 907.5],
      [9075, 0.15, 5081.25],
      [36900, 0.25, 18193.75],
      [89350, 0.28, 45353.75],
      [186350, 0.33, 117541.25],
      [405100, 0.35, 118118.75],
      [406750, 0.396]
    ]
  }
}
```
The total tax is left empty on the last bracket since there is no maximum. The total tax is also not available in the individual JSON files; it is calculated and added in during the concatenation process. 

Pull requests to update or correct any of the tax rates are welcome.

License
---
The data is licensed under the [CC BY-NC 4.0 license](http://creativecommons.org/licenses/by-nc/4.0/), while the code for the project is licensed under the [MIT license](LICENSE).