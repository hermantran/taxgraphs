# TaxGraphs

TaxGraphs is a web app that graphs marginal and effective tax rates against income for each US state. Graphs include a comparison between overall state tax rates and a detailed breakdown of each state's tax rate into its individual components. Tax data is collected from each state's official website and the [Tax Foundation](http://taxfoundation.org/article/state-individual-income-tax-rates).

Setup
---
To run the app locally, install [Node.js](http://nodejs.org/download/) and then execute the following from the project directory:
```
npm install -g grunt-cli
npm install
```
Executing `grunt` will set up `grunt-watch` to monitor changes and compile the static assets and tax data. It will also set up the app locally at `localhost:1337` with livereload enabled.

Executing `grunt dist` will prepare the app for distribution with concatenated and minified assets.

Data
---
Pull requests to update or correct any of the tax rates are welcome.

License
---
The data is licensed under the [CC BY-NC 4.0 license](http://creativecommons.org/licenses/by-nc/4.0/), while the code for the project is licensed under the [MIT license](LICENSE).