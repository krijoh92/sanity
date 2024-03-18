import assert from 'node:assert'

import {describe, expect, test} from '@jest/globals'
import {defineType} from '@sanity/types'

import {Schema} from '../../src/legacy/Schema'
import {extractSchema} from '../../src/sanity/extractSchema'
import {groupProblems} from '../../src/sanity/groupProblems'
import {validateSchema} from '../../src/sanity/validateSchema'
import schemaFixtures from '../legacy/fixtures/schemas'
// built-in types
import assetSourceData from './fixtures/assetSourceData'
import Block from './fixtures/block'
import fileAsset from './fixtures/fileAsset'
import geopoint from './fixtures/geopoint'
import imageAsset from './fixtures/imageAsset'
import imageCrop from './fixtures/imageCrop'
import imageDimensions from './fixtures/imageDimensions'
import imageHotspot from './fixtures/imageHotspot'
import imageMetadata from './fixtures/imageMetadata'
import imagePalette from './fixtures/imagePalette'
import imagePaletteSwatch from './fixtures/imagePaletteSwatch'
import slug from './fixtures/slug'

const builtinTypes = [
  assetSourceData,
  slug,
  geopoint,
  imageAsset,
  fileAsset,
  imageCrop,
  imageHotspot,
  imageMetadata,
  imageDimensions,
  imagePalette,
  imagePaletteSwatch,
]

// taken from sanity/src/core/schema/createSchema.ts
function createSchema(schemaDef: {name: string; types: any[]}) {
  const validated = validateSchema(schemaDef.types).getTypes()
  const validation = groupProblems(validated)
  const hasErrors = validation.some((group) =>
    group.problems.some((problem) => problem.severity === 'error'),
  )

  return Schema.compile({
    name: 'test',
    types: hasErrors ? [] : [...schemaDef.types, ...builtinTypes].filter(Boolean),
  })
}

describe('Extract schema test', () => {
  test('Extracts  schema general', () => {
    const schema = createSchema({
      name: 'test',
      types: [
        defineType({
          title: 'Valid document',
          name: 'validDocument',
          type: 'document',
          fields: [
            {
              title: 'Title',
              name: 'title',
              type: 'string',
            },
            {
              title: 'List',
              name: 'list',
              type: 'string',
              options: {
                list: ['a', 'b', 'c'],
              },
              validation: (Rule) => Rule.required(),
            },
            {
              title: 'Number',
              name: 'number',
              type: 'number',
            },
            {
              title: 'some other object',
              name: 'someInlinedObject',
              type: 'obj',
            },
            {
              title: 'Manuscript',
              name: 'manuscript',
              type: 'manuscript',
            },
            {
              title: 'Some text',
              name: 'someTextType',
              type: 'someTextType',
            },
            {
              title: 'customStringType',
              name: 'customStringType',
              type: 'customStringType',
            },
            {
              title: 'Blocks',
              name: 'blocks',
              type: 'array',
              of: [{type: 'block'}],
            },
            {
              type: 'reference',
              name: 'other',
              to: {
                type: 'otherValidDocument',
              },
            },
            {
              type: 'reference',
              name: 'others',
              to: [
                {
                  type: 'otherValidDocument',
                },
              ],
            },
          ],
        }),
        {
          title: 'Author',
          name: 'author',
          type: 'document',
          fields: [
            {
              title: 'Name',
              name: 'name',
              type: 'string',
            },
            {
              title: 'Profile picture',
              name: 'profilePicture',
              type: 'image',
              options: {
                hotspot: true,
              },
              fields: [
                {
                  name: 'caption',
                  type: 'string',
                  title: 'Caption',
                },
                {
                  name: 'attribution',
                  type: 'string',
                  title: 'Attribution',
                },
              ],
            },
          ],
        },
        {
          title: 'Book',
          name: 'book',
          type: 'document',
          fields: [
            {
              title: 'Name',
              name: 'name',
              type: 'string',
            },
          ],
        },
        Block,
        {
          title: 'Other valid document',
          name: 'otherValidDocument',
          type: 'document',
          fields: [
            {
              title: 'Title',
              name: 'title',
              type: 'string',
            },
          ],
        },
        {
          type: 'object',
          name: 'obj',
          fields: [
            {
              title: 'Field #1',
              name: 'field1',
              type: 'string',
            },
            {
              title: 'Field #2',
              name: 'field2',
              type: 'number',
            },
          ],
        },
        defineType({
          name: 'customStringType',
          title: 'My custom string type',
          type: 'string',
        }),
        {
          type: 'object',
          name: 'code',
          fields: [
            {
              title: 'The Code!',
              name: 'thecode',
              type: 'string',
            },
          ],
        },
        {
          title: 'Manuscript',
          name: 'manuscript',
          type: 'file',
          fields: [
            {
              name: 'description',
              type: 'string',
              title: 'Description',
            },
            {
              name: 'author',
              type: 'reference',
              title: 'Author',
              to: {type: 'author'},
            },
          ],
        },
        defineType({
          name: 'someTextType',
          type: 'text',
        }),
      ],
    })

    const extracted = extractSchema(schema)
    expect(extracted.map((v) => v.name)).toStrictEqual([
      'sanity.imagePaletteSwatch',
      'sanity.imagePalette',
      'sanity.imageDimensions',
      'geopoint',
      'slug',
      'someTextType',
      'sanity.fileAsset',
      'code',
      'customStringType',
      'blocksTest',
      'book',
      'author',
      'sanity.imageCrop',
      'sanity.imageHotspot',
      'sanity.imageAsset',
      'sanity.assetSourceData',
      'sanity.imageMetadata',
      'validDocument',
      'otherValidDocument',
      'manuscript',
      'obj',
    ])
    const validDocument = extracted.find((type) => type.name === 'validDocument')
    expect(validDocument).toBeDefined()
    assert(validDocument !== undefined) // this is a workaround for TS, but leave the expect above for clarity in case of failure

    expect(validDocument.name).toEqual('validDocument')
    expect(validDocument.type).toEqual('document')
    assert(validDocument.type === 'document') // this is a workaround for TS https://github.com/DefinitelyTyped/DefinitelyTyped/issues/41179
    expect(Object.keys(validDocument.attributes)).toStrictEqual([
      '_id',
      '_type',
      '_createdAt',
      '_updatedAt',
      '_rev',
      'title',
      'list',
      'number',
      'someInlinedObject',
      'manuscript',
      'someTextType',
      'customStringType',
      'blocks',
      'other',
      'others',
    ])

    // Check that the block type is extracted correctly, as an array
    expect(validDocument.attributes.blocks.type).toEqual('objectAttribute')
    expect(validDocument.attributes.blocks.value.type).toEqual('array')
    assert(validDocument.attributes.blocks.value.type === 'array') // this is a workaround for TS
    expect(validDocument.attributes.blocks.value.of.type).toEqual('object')
    assert(validDocument.attributes.blocks.value.of.type === 'object') // this is a workaround for TS
    expect(Object.keys(validDocument.attributes.blocks.value.of.attributes)).toStrictEqual([
      'children',
      'style',
      'listItem',
      'markDefs',
      'level',
      '_type',
    ])

    expect(validDocument.attributes.blocks.value.of.attributes.children.value.type).toEqual('array')
    assert(validDocument.attributes.blocks.value.of.attributes.children.value.type === 'array') // this is a workaround for TS
    expect(validDocument.attributes.blocks.value.of.attributes.children.value.of.type).toEqual(
      'object',
    )
    assert(validDocument.attributes.blocks.value.of.attributes.children.value.of.type === 'object') // this is a workaround for TS
    expect(
      Object.keys(validDocument.attributes.blocks.value.of.attributes.children.value.of.attributes),
    ).toStrictEqual(['marks', 'text', '_type'])

    expect(extracted).toMatchSnapshot()
  })

  test('order of types does not matter', () => {
    const schema1 = createSchema({
      name: 'test',
      types: [
        {
          title: 'Author',
          name: 'author',
          type: 'object',
          fields: [
            {
              title: 'Name',
              name: 'name',
              type: 'string',
            },
          ],
        },
        {
          title: 'Book',
          name: 'book',
          type: 'document',
          fields: [
            {
              title: 'Name',
              name: 'name',
              type: 'string',
            },
            {
              title: 'Author',
              name: 'author',
              type: 'author',
            },
          ],
        },
      ],
    })

    expect(extractSchema(schema1).map((v) => v.name)).toStrictEqual([
      'sanity.imagePaletteSwatch',
      'sanity.imagePalette',
      'sanity.imageDimensions',
      'sanity.imageHotspot',
      'sanity.imageCrop',
      'sanity.fileAsset',
      'sanity.imageAsset',
      'sanity.imageMetadata',
      'geopoint',
      'slug',
      'sanity.assetSourceData',
      'book',
      'author',
    ])
  })

  describe('Can extract sample fixtures', () => {
    const cases = Object.keys(schemaFixtures).map((schemaName) => {
      const schema = createSchema(schemaFixtures[schemaName])
      if (schema._original.types.length === 0) {
        return {schemaName, schema: null}
      }
      return {schemaName, schema}
    })
    const passes = cases.filter((v): v is {schemaName: string; schema: Schema} => v.schema !== null)

    test.each(passes)('extracts schema $schemaName', ({schema}) => {
      const extracted = extractSchema(schema)
      expect(extracted.length).toBeGreaterThan(0) // we don't really care about the exact number, just that it passes :+1:
    })

    const skips = cases.filter((v): v is {schemaName: string; schema: null} => v.schema === null)
    test.skip.each(skips)('extracts schema $schemaName', () => {
      // Add a test for the skipped cases so we can track them in the test report
    })
  })
})
