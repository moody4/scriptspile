# Adobe Illustrator

Adobe Illustrator scripts are small programs written in JavaScript that can automate tasks in Adobe Illustrator. Scripts provide a way to extend the functionality of Illustrator by allowing users to automate repetitive tasks and customize their workflows. The Scripts menu in Illustrator provides easy access to all installed scripts, and users can also add their own scripts to the Scripts folder.

## How to run scripts

#### Option 1 — Install 

1. Place `.jsx` file in the Illustrator Scripts folder:
- OS X: 
  	- `/Applications/Adobe Illustrator [vers.]/Presets.localized/en_GB/Scripts`
- Windows (32 bit): 
  	- `C:\Program Files (x86)\Adobe\Adobe Illustrator [vers.]\Presets\en_GB\Scripts\`
- Windows (64 bit): 
    - `C:\Program Files\Adobe\Adobe Illustrator [vers.] (64 Bit)\Presets\en_GB\Scripts\`
2. Restart Illustrator

#### Option 2 — Drag & Drop
Drag and drop the script `.jsx` file onto the tabs of Illustrator documents. If you drag it to the area of the open document, the script may not work correctly (Adobe bug).  

![drag](https://i.ibb.co/WP9S7Lh/drag-n-drop-area.jpg)

#### Option 3 — Use extensions
We recommend the [Scripshon Trees] or [LAScripts] panel. There you can specify the folder where your script files are stored.

[Scripshon Trees]: https://exchange.adobe.com/creativecloud.details.15873.scripshon-trees.html
[LAScripts]: https://ladygin.pro/products/lascripts/

::: warning   
To run scripts via the F1-F15 hotkeys, users add them to the Actions panel. If another action is running inside the script, Illustrator will freeze. How do you check it? Open the script in a text editor, if you find `app.doScript()` in the code, it is using an action. This is in all versions from CS6 to CC 2023 on Mac and Windows.
:::

## Illustrator versions difference
<CodeGroup>
  <CodeGroupItem title="v25.0" active>

```js:no-line-numbers
//One thing doesn't work
```

  </CodeGroupItem>

  <CodeGroupItem title="v26.0">

```js:no-line-numbers
//Another thing doesn't work
```

  </CodeGroupItem>

  <CodeGroupItem title="v27.0">

```js:no-line-numbers
//Both don't work
```

  </CodeGroupItem>
</CodeGroup>

# Scripts

<PageFilter filterKey="software" filterValue="illustrator" />