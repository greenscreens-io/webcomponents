# GSStore WebComponent

GSStore WebComponent is a non-UI element for loading external data, paging data and limiting data view.

Events fired from this component are used by [GSTable](GSTable.md) to refresh its UI.

Every ```<gs-item>``` child element represents loaded record column which name is mapped to a data column name.

<br>

## Attributes
---

Refer to GSDataHandler!


<br>

## Operational modes
---

Operational modes are URL query format definition. 

     * quark - JSON path to CRUD object; ie. io.greenscreens.CRUD
     * rest - url rest format, ie. /${limit}/${skip}?sort=${sort}&filter=${filter}
     * query - url format, ie. ?limit=${limit}&skip=${skip}&sort=${sort}&filter=${filter}

NOTE: When Green Screens Quark engien is used for RPC calls, "src" attribute is ignored.
The whole communication is handled inside Quark Engien defined functions. 

<br>

## Example
---

Example below limits data retrieval to 10 records from URL named in "src" attribute. 
All data responses must return JSON array or HTTP error.

```html
<!-- Default is QUERY mode -->
<gs-store src="/data/employees" id="employees" limit=10>
    <gs-item name="Age" type="number"></gs-item>
    <gs-item name="Salary" type="number" format="$\d"></gs-item>
    <gs-item name="Start date" type="date" format="yyyy/mm/dd"></gs-item>
</gs-store>
```

Use QUARK engine or any external async function attached to globalThis path

```html
 <gs-store id="handler" mode="quark" reader="io.test.read" writer="io.test.write"></gs-store>
 ```

Use externaly defined GSReadWRite. Can be rpealoaded custom class extending GSAbstractReadWrite.
Custom class must be initialized with id="handler". 

```html
 <gs-store id="handler"></gs-store>
 ```