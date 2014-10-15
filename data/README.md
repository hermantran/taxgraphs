Data
---
The [2014/](2014) folder contains the individual JSON files for federal and each state's tax rates. The `json-bake` task concatenates all the JSON files together, and a custom Grunt task then preproceses the tax data and minifies the final JSON into [2014.json](2014.json).

The `rate` property for each tax can be one of the following types:
- Number: A flat tax rate.
- Array: A set of marginal tax brackets.
- Object: Sets of marginal tax brackets for different filing statuses.

Each marginal tax bracket has the following structure: 
```
[
  Bracket income minimum,
  Bracket marginal tax rate,
  Total tax at the bracket income maximum
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
The total tax is not available for the last bracket since there is no maximum. The total tax is also not available in any tax bracket for the individual JSON files; it is instead calculated and added to the final JSON file during compilation.

Pull requests to update or correct any of the tax rates are welcome.

License
---
The data is licensed under the [CC BY-NC 4.0 license](http://creativecommons.org/licenses/by-nc/4.0/).