import { describe, it, expect, vi } from 'vitest'
import {
  ConfigParser,
  parseTableConfig,
  parseFormConfig,
  parseSearchConfig,
  validateTableConfig,
  validateFormConfig,
  validateSearchConfig,
} from '@/lib/config-parser'
import {
  ConfigError,
  ValidationError,
  ERROR_CODES,
} from '@/types/config-errors'
import type {
  TableConfig,
  FormConfig,
  SearchFormConfig,
  ColumnConfig,
  FieldConfig,
  SearchFieldConfig,
} from '@/types/config'

describe('ConfigParser', () => {
  describe('parseTableConfig', () => {
    it('should parse valid table config', () => {
      const userConfig = {
        columns: [
          {
            key: 'name',
            title: '姓名',
            dataIndex: 'name',
            type: 'text' as const,
          },
        ],
      }

      const result = parseTableConfig(userConfig)

      expect(result).toBeDefined()
      expect(result.columns).toHaveLength(1)
      expect(result.columns[0].key).toBe('name')
      expect(result.size).toBe('middle') // 默认值
      expect(result.searchable).toBe(true) // 默认值
    })

    it('should throw ConfigError for invalid config', () => {
      expect(() => parseTableConfig(null as any)).toThrow(ConfigError)
      expect(() => parseTableConfig({})).toThrow(ConfigError)
      expect(() => parseTableConfig({ columns: null })).toThrow(ConfigError)
    })

    it('should throw ValidationError for empty columns', () => {
      const userConfig = { columns: [] }
      expect(() => parseTableConfig(userConfig)).toThrow(ValidationError)
    })

    it('should validate column configuration', () => {
      const userConfig = {
        columns: [
          {
            key: 'name',
            // missing title and dataIndex
          },
        ],
      }

      expect(() => parseTableConfig(userConfig)).toThrow(ValidationError)
    })
  })

  describe('parseFormConfig', () => {
    it('should parse valid form config', () => {
      const userConfig = {
        fields: [
          {
            key: 'name',
            name: 'name',
            label: '姓名',
            type: 'input' as const,
          },
        ],
      }

      const result = parseFormConfig(userConfig)

      expect(result).toBeDefined()
      expect(result.fields).toHaveLength(1)
      expect(result.fields[0].key).toBe('name')
      expect(result.layout).toBe('horizontal') // 默认值
      expect(result.resetable).toBe(true) // 默认值
    })

    it('should throw ConfigError for invalid config', () => {
      expect(() => parseFormConfig(null as any)).toThrow(ConfigError)
      expect(() => parseFormConfig({})).toThrow(ConfigError)
    })

    it('should validate field configuration', () => {
      const userConfig = {
        fields: [
          {
            key: 'name',
            // missing name, label, and type
          },
        ],
      }

      expect(() => parseFormConfig(userConfig)).toThrow(ValidationError)
    })

    it('should validate field options for select type', () => {
      const userConfig = {
        fields: [
          {
            key: 'status',
            name: 'status',
            label: '状态',
            type: 'select' as const,
            options: [
              { label: '启用' }, // missing value
            ],
          },
        ],
      }

      expect(() => parseFormConfig(userConfig)).toThrow(ValidationError)
    })
  })

  describe('parseSearchConfig', () => {
    it('should parse valid search config', () => {
      const userConfig = {
        fields: [
          {
            key: 'name',
            label: '姓名',
            type: 'input' as const,
          },
        ],
      }

      const result = parseSearchConfig(userConfig)

      expect(result).toBeDefined()
      expect(result.fields).toHaveLength(1)
      expect(result.fields[0].key).toBe('name')
      expect(result.layout).toBe('horizontal') // 默认值
      expect(result.collapsible).toBe(false) // 默认值
    })

    it('should throw ConfigError for invalid config', () => {
      expect(() => parseSearchConfig(null as any)).toThrow(ConfigError)
      expect(() => parseSearchConfig({})).toThrow(ConfigError)
    })

    it('should validate search field options', () => {
      const userConfig = {
        fields: [
          {
            key: 'status',
            label: '状态',
            type: 'select' as const,
            options: [
              { label: '启用' }, // missing value
            ],
          },
        ],
      }

      expect(() => parseSearchConfig(userConfig)).toThrow(ValidationError)
    })
  })

  describe('validateTableConfig', () => {
    it('should validate valid table config', () => {
      const config: TableConfig = {
        columns: [
          {
            key: 'name',
            title: '姓名',
            dataIndex: 'name',
            type: 'text',
          },
        ],
        size: 'middle',
        bordered: false,
        striped: false,
        searchable: true,
        exportable: false,
        selectable: false,
      }

      const result = validateTableConfig(config)
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should return validation errors for invalid config', () => {
      const config = {
        columns: [], // empty columns
      } as TableConfig

      const result = validateTableConfig(config)
      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it('should validate column status map', () => {
      const config: TableConfig = {
        columns: [
          {
            key: 'status',
            title: '状态',
            dataIndex: 'status',
            type: 'status',
            statusMap: {
              1: { text: '启用' }, // missing color
            },
          },
        ],
        size: 'middle',
        bordered: false,
        striped: false,
        searchable: true,
        exportable: false,
        selectable: false,
      }

      const result = validateTableConfig(config)
      expect(result.valid).toBe(false)
    })
  })

  describe('validateFormConfig', () => {
    it('should validate valid form config', () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'name',
            name: 'name',
            label: '姓名',
            type: 'input',
          },
        ],
        layout: 'horizontal',
        resetable: true,
        submitable: true,
        size: 'middle',
        disabled: false,
      }

      const result = validateFormConfig(config)
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should validate field name type', () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'name',
            name: 123 as any, // invalid type
            label: '姓名',
            type: 'input',
          },
        ],
        layout: 'horizontal',
        resetable: true,
        submitable: true,
        size: 'middle',
        disabled: false,
      }

      const result = validateFormConfig(config)
      expect(result.valid).toBe(false)
    })
  })

  describe('ConfigParser static methods', () => {
    it('should parse table config using static method', () => {
      const userConfig = {
        columns: [
          {
            key: 'name',
            title: '姓名',
            dataIndex: 'name',
          },
        ],
      }

      const result = ConfigParser.parseTable(userConfig)
      expect(result).toBeDefined()
      expect(result.columns).toHaveLength(1)
    })

    it('should parse form config using static method', () => {
      const userConfig = {
        fields: [
          {
            key: 'name',
            name: 'name',
            label: '姓名',
            type: 'input' as const,
          },
        ],
      }

      const result = ConfigParser.parseForm(userConfig)
      expect(result).toBeDefined()
      expect(result.fields).toHaveLength(1)
    })

    it('should validate config using static method', () => {
      const config: TableConfig = {
        columns: [
          {
            key: 'name',
            title: '姓名',
            dataIndex: 'name',
          },
        ],
        size: 'middle',
        bordered: false,
        striped: false,
        searchable: true,
        exportable: false,
        selectable: false,
      }

      const result = ConfigParser.validate(config, validateTableConfig)
      expect(result.valid).toBe(true)
    })

    it('should safely parse config and return success result', () => {
      const userConfig = {
        columns: [
          {
            key: 'name',
            title: '姓名',
            dataIndex: 'name',
          },
        ],
      }

      const result = ConfigParser.safeParse(userConfig, parseTableConfig)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.columns).toHaveLength(1)
      }
    })

    it('should safely parse config and return error result', () => {
      const userConfig = {} // invalid config

      const result = ConfigParser.safeParse(userConfig, parseTableConfig)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBeInstanceOf(Error)
      }
    })
  })

  describe('Error handling', () => {
    it('should throw ConfigError with correct error code', () => {
      try {
        parseTableConfig(null as any)
      } catch (error) {
        expect(error).toBeInstanceOf(ConfigError)
        expect((error as ConfigError).code).toBe(ERROR_CODES.CONFIG_INVALID)
      }
    })

    it('should throw ValidationError with error details', () => {
      try {
        parseTableConfig({ columns: [] })
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError)
        expect((error as ValidationError).errors).toBeDefined()
        expect((error as ValidationError).errors.length).toBeGreaterThan(0)
      }
    })
  })
})