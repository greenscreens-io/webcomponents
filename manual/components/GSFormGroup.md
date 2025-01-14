# GSFormGroup WebComponent
 
GSFormGroup WebComponent renders input and label vertically or horizontally wrapped into Bootstrap form control.
 
<br>
 
## Attributes ```<gs-form-group>```
---

Except all standard ```<input>``` [tag attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#list), addional attributes are listed below with specaial meaning.

 
| Name               | Description                                              |
|--------------------|----------------------------------------------------------|
| css-label          | CSS classes for field label                              |
| css-field          | CSS classes for field element                            |
| cell-label         | CSS classes for label wrapper (col)                      |
| cell-field         | CSS classes for field wrapper (col)                      |
| autoid             | If enabled, id set to field name if not already set      |
| autocopy           | Copy all text on click into a field                      |
| autoselect         | Select all text on click into a field                    |
| default            | Default value                                            |
| icon               | Tooltip icon                                             |
| mask               | When masked input required (refer to GSInputExt)         |
| label              | Input field visible label                                |
| layout             | Orientation type (vertical, horizontal, floating)        |
| reveal             | Allow password reveal on shortcut                        |
| reverse            | Only for "range type" to display max value first         |
| placement          | Tooltip placement (deafult right)                        |
| description        | Tooltip content - describe field purpose                 |

**NOTE**: All HTML input element attributes are allowed.

**NOTE**: Attribute "reverse" is usefull when default value is max and need to decrement to min value.

<br>
 
## Slots
---

| Name               | Description                                              |
|--------------------|----------------------------------------------------------|
| icon               | Place HTML content into icon position                    |
| body               | Place HTML content into body position                    |
| header             | Place HTML content into header position                  |
| footer             | Place HTML content into footer position                  |

<br>

## Example
---
 
**NOTE :**
For more details, check [Form Group Demo](../../demos/formgroup.html)
 
```html
        <gs-form-group css="mt-2" name="user" placeholder="...enter user name" label="Date" description="Login user"></gs-form-group>

        <gs-form-group name="date" mask="DD-MM-YYYY" label="Date" description="Masked date input"></gs-form-group>

        <gs-form-group css="mt-2" name="field1" label="Check box"    type="checkbox" checked></gs-form-group>
        <gs-form-group css="mt-2" name="field2" label="Radio button" type="radio" checked></gs-form-group>
        <gs-form-group css="mt-2" name="field3" label="Switch box"   type="switch" checked></gs-form-group>

        <gs-form-group css="mt-2" name="field4" label="Range" type="range" min="0" max="100" step="2"></gs-form-group>
```

Custom element injected
```html
        <gs-form-group css="mt-2" name="active" label="Status" description="test">
            <template>
                <select class="form-select" id="active" name="active" required>
                    <option value="true">Enabled</option>
                    <option value="false">Disabled</option>
                </select>
            </template>
        </gs-form-group>
```

<br>

&copy; Green Screens Ltd. 2016 - 2025
