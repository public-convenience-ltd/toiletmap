const path = require('path');
const fs = require('fs');
const appRootDir = require('app-root-dir').get();

const componentPageTemplate = path.resolve(
  'src/templates/ComponentPage/index.js'
);
const tableOfContentsTemplate = path.resolve('src/templates/TOC/index.js');

exports.createPages = ({ graphql, actions }) => {
  const { createPage } = actions;

  return new Promise((resolve, reject) => {
    resolve(
      Promise.all([
        graphql(`
          {
            allComponentMetadata {
              edges {
                node {
                  id
                  displayName
                  description {
                    text
                  }
                  props {
                    name
                    type {
                      value
                      raw
                      name
                    }
                    description {
                      text
                    }
                    required
                  }
                }
              }
            }
          }
        `),
        graphql(`
          {
            allMarkdownRemark(
              filter: { fileAbsolutePath: { regex: "/README.md/" } }
            ) {
              edges {
                node {
                  id
                  fileAbsolutePath
                  html
                }
              }
            }
          }
        `),
      ])
        .then(([docgenResult, markdownResult]) => {
          const errors = docgenResult.errors || markdownResult.errors;

          if (errors) {
            reject(new Error(errors));
            return;
          }

          // It would be nicer and less fragile to build a relationship between allComponentMetadata
          // and allMarkdownRemark which didn't rely on accessing an index
          const allComponents = docgenResult.data.allComponentMetadata.edges
            .map(
              (edge, i) => {
                return Object.assign({}, edge.node, {
                  filePath: `/components/${edge.node.displayName}/`,
                  html:
                    markdownResult.data.allMarkdownRemark.edges[i].node.html,
                });
              }
              // Filter out metadata results which don't have a README markdown file
            )
            .filter(c => c);

          var exportFileContents =
            allComponents
              .reduce((accumulator, { displayName, filePath }) => {
                const absolutePath = path.resolve(
                  path.join('src', filePath, displayName)
                );

                accumulator.push(
                  `export { default as ${displayName} } from "${absolutePath}";`
                );

                return accumulator;
              }, [])
              .join('\n') + '\n';

          fs.writeFileSync(
            path.join(appRootDir, '.cache/components.js'),
            exportFileContents
          );

          allComponents.forEach(data => {
            const { filePath } = data;
            const context = Object.assign({}, data, {
              allComponents,
            });

            createPage({
              path: filePath,
              component: componentPageTemplate,
              context,
            });
          });

          createPage({
            path: path.resolve('/components'),
            component: tableOfContentsTemplate,
            context: {
              allComponents,
            },
          });
        })
        .catch(err => {
          console.log(err);
          throw new Error(err);
        })
    );
  });
};
