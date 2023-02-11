---
home: true
title: Home
# heroImage: https://vuepress.github.io/images/hero.png
actions:
  - text: By Authors
    link: /authors 
    type: primary
  - text: Tags
    link: /tags
    type: secondary
  - text: Illustrator
    link: /illustrator
    type: secondary
  - text: Photoshop
    link: /photoshop
    type: secondary

features:
  # - title: Resilience
  #   details: Helps the pile to survive in difficult environments.
  # - title: Security
  #   details: Ensures that the pile is kept safe from harm.
  # - title: Compatibility
  #   details: Ensures that the pile can be integrated with other systems!
footer: MIT Licensed | Copyright © 2023 CodeGraphics
---

### Run ScriptsPile Locally
```sh
// Clone repository
git clone https://github.com/moody4/sсriptspile.git

// Install dependencies
npm install

// Run local server: localhost:8080
npm run dev
```
### Random Featuring

<ClientOnly>  
  <Transition name="fade" appear>
    <RandomFeaturing />
  </Transition>
</ClientOnly>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: all 0.5s ease-in-out;
}

.fade-enter-from,
.fade-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}
</style>