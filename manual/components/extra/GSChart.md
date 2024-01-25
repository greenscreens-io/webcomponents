# GSChart WebComponent

GSChart WebComponent is a ChartJS library renderer.

GSChart WebComponent load 2 types of data:
 - options to configure chart
 - data to load chart data

Both types can be laoded from external URL or from configured ```<gs-items>``` child elements.
If both are used, ```<gs-items>``` are used to override loaded JSON options (if defined).

Utiltiy **GSItem.toJson** and **GSItem.toDom** are used to convert JSON object to ```<gs-items>``` structure and opposite.

<br>

## Attributes ```<gs-chart>```
---

| Name               | Description                                         |
|--------------------|-----------------------------------------------------|
| css                | CSS classes for chart canvas element                |
| width              | Chart widht in pixels                               |
| height             | Chart height in pixels                              |
| data               | JSON Array with chart data                          |
| options            | JSON configurtion object                            |
| config             | URL location for JSON configurtion                  |


<br>

## Example
---

**NOTE :** 
For more details, check [chart.html](../../demos/extra/GSChart.html)

Loading data and options from remote resource

```html
<gs-chart width="800" height="600" css="" config="data/options.json" url="data/data.json"></gs-chart>
```

Loading options from remote resource and applying overrides (bar -> pie) from config structure.

```html
<gs-chart width="800" height="600" config="data/options.json" url="data/data.json">
    <gs-item group="options">
        <gs-item name="type" value="pie" type="string"></gs-item>
    </gs-item>
</gs-chart>
```

Loading complete options from config structure.

```html
<gs-chart width="800" height="600" url="data/data.json">
    <gs-item group="options" type="object">
        <gs-item name="type" value="bar" type="string"></gs-item>
        <gs-item name="data" type="object">
            <gs-item name="labels" type="array">
                <gs-item value="Red" type="string"></gs-item>
                <gs-item value="Blue" type="string"></gs-item>
                <gs-item value="Yellow" type="string"></gs-item>
                <gs-item value="Green" type="string"></gs-item>
                <gs-item value="Purple" type="string"></gs-item>
                <gs-item value="Orange" type="string"></gs-item>
            </gs-item>
            <gs-item name="datasets" type="array">
                <gs-item name="0" type="object">
                    <gs-item name="label" value="# of Votes" type="string"></gs-item>
                    <gs-item name="_data_" type="array">
                        <gs-item value="12" type="number"></gs-item>
                        <gs-item value="19" type="number"></gs-item>
                        <gs-item value="3" type="number"></gs-item>
                        <gs-item value="5" type="number"></gs-item>
                        <gs-item value="2" type="number"></gs-item>
                        <gs-item value="3" type="number"></gs-item>
                    </gs-item>
                    <gs-item name="backgroundColor" type="array">
                        <gs-item value="rgba(255, 99, 132, 0.2)" type="string"></gs-item>
                        <gs-item value="rgba(54, 162, 235, 0.2)" type="string"></gs-item>
                        <gs-item value="rgba(255, 206, 86, 0.2)" type="string"></gs-item>
                        <gs-item value="rgba(75, 192, 192, 0.2)" type="string"></gs-item>
                        <gs-item value="rgba(153, 102, 255, 0.2)" type="string"></gs-item>
                        <gs-item value="rgba(255, 159, 64, 0.2)" type="string"></gs-item>
                    </gs-item>
                    <gs-item name="borderColor" type="array">
                        <gs-item value="rgba(255, 99, 132, 1)" type="string"></gs-item>
                        <gs-item value="rgba(54, 162, 235, 1)" type="string"></gs-item>
                        <gs-item value="rgba(255, 206, 86, 1)" type="string"></gs-item>
                        <gs-item value="rgba(75, 192, 192, 1)" type="string"></gs-item>
                        <gs-item value="rgba(153, 102, 255, 1)" type="string"></gs-item>
                        <gs-item value="rgba(255, 159, 64, 1)" type="string"></gs-item>
                    </gs-item>
                    <gs-item name="borderWidth" value="1" type="number"></gs-item>
                </gs-item>
            </gs-item>
        </gs-item>
        <gs-item name="options" type="object">
            <gs-item name="responsive" value="true" type="boolean"></gs-item>
            <gs-item name="maintainAspectRatio" value="true" type="boolean"></gs-item>
            <gs-item name="scales" type="object">
                <gs-item name="x" type="object">
                    <gs-item name="display" value="true" type="boolean"></gs-item>
                </gs-item>
                <gs-item name="y" type="object">
                    <gs-item name="beginAtZero" value="true" type="boolean"></gs-item>
                    <gs-item name="display" value="true" type="boolean"></gs-item>
                </gs-item>
            </gs-item>
        </gs-item>
    </gs-item>        
</gs-chart>
```

<br>

&copy; Green Screens Ltd. 2016 - 2024
