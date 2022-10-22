# GSFormGroup WebComponent
 
GSFormGroup WebComponent renders input and label vertically or horizontally wrapped into Bootstrap form control.

<br>
 
## Attributes ```<gs-form-group>```
---

Except all standard ```<input>``` [tag attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#list), addional attributes are listed below with specaial meaning.

 
| Name               | Description                                              |
|--------------------|----------------------------------------------------------|
| css                | CSS classes for main content                             |
| css-label          | CSS classes for field label                              |
| css-field          | CSS classes for field element                            |
| cell-label         | CSS classes for label wrapper (col)                      |
| cell-field         | CSS classes for field wrapper (col)                      |
| layout             | Orientation type (vertical, horizontal, floating)        |
| label              | Input field visible label                                |
| placement          | Tooltip placement (deafult right)                        |
| description        | Tooltip content - describe field purpose                 |
| icon               | Tooltip icon                                             |
| mask               | When masked input required (refer to GSInputExt)         |

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

