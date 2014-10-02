# TaxGraphs

TaxGraphs is a web app that graphs marginal and effective tax rates against income for each US state. Graphs include a comparison between state taxes and a detailed breakdown of each state tax into its individual components. Data for the taxes is collected from each state's official website and checked with tax rates provided by the [Tax Foundation](http://taxfoundation.org/article/state-individual-income-tax-rates).

Setup
---
```
npm install -g grunt-cli
npm install
```
To set up background tasks and view locally for development, run `grunt`, and then browse to `localhost:1337`.

To prepare the app for distribution, run `grunt dist`.

Data
---
Pull requests to update or correct any of the tax rates are welcome.

License
---
The data is licensed under the [CC BY-NC 4.0 license](http://creativecommons.org/licenses/by-nc/4.0/), while the code for the project is licensed under the [MIT license](LICENSE).