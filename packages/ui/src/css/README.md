This directory holds global CSS. Global CSS is bad, trust me - there are many articles out there to back this up, and is the reason we use [css-modules](https://github.com/css-modules/css-modules) for scoping CSS in a modular way.

There are exceptions where we need CSS to be scoped globally, [normalising]((https://github.com/necolas/normalize.css) and where are styles aren't targetting a React Component. For such cases we should adopt a [BEM syntax](http://getbem.com/naming).
