import { describe, it, expect, vi } from 'vitest'
import {
  createDefaultColumnConfig,
  createDefaultFieldConfig,
  createDefaultSearchFieldConfig,
  createDefaultTableConfig,
  createDefaultFormConfig,
  createDefaultSearchConfig,
  TableConfigBuilder,
  FormConfigBuilder,
  SearchConfigBuilder,
  createTableBuilder,
  createFormBuilder,
  createSearchBuilder,
} from '@/lib/config-defaults'
import type {
  ColumnConfig,
  FieldConfig,
  SearchFieldConfig,
  TableConfig,
  FormConfig,
  SearchFormConfig,
} from '@/types/config'

describe('Config Defaults', () => {
  describe('createDefaultColumnConfig', () => {
    it('should create default column config', () => {
      const config = createDefaultColumnConfig()
      
      expect(config.key).toBe('')
      expect(config.title).toBe('')
      expect(config.dataIndex).toBe('')
      expect(config.align).toBe('left')
      expect(config.sortable).toBe(false)
      expect(config.type).toBe('text')
    })

    it('should merge overrides with defaults', () => {
      const overrides = {
        key: 'name',
        title: '姓名',
        dataIndex: 'name',
        sortable: true,
      }

      const config = createDefaultColumnConfig(overrides)
      
      expect(config.key).toBe('name')
      expect(config.title).toBe('姓名')
      expect(config.sortable).toBe(true)
      expect(config.align).toBe('left') // 保持默认值
    })
  })

  describe('createDefaultFieldConfig', () => {
    it('should create default field config', () => {
      const config = createDefaultFieldConfig()
      
      expect(config.key).toBe('')
      expect(config.name).toBe('')
      expect(config.label).toBe('')
      expect(config.type).toBe('input')
      expect(config.required).toBe(false)
      expect(config.disabled).toBe(false)
    })

    it('should merge overrides with defaults', () => {
      const overrides = {
        key: 'email',
        name: 'email',
        label: '邮箱',
        type: 'input' as const,
        required: true,
      }

      const config = createDefaultFieldConfig(overrides)
      
      expect(config.key).toBe('email')
      expect(config.label).toBe('邮箱')
      expect(config.required).toBe(true)
      expect(config.disabled).toBe(false) // 保持默认值
    })
  })

  describe('createDefaultSearchFieldConfig', () => {
    it('should create default search field config', () => {
      const config = createDefaultSearchFieldConfig()
      
      expect(config.key).toBe('')
      expect(config.label).toBe('')
      expect(config.type).toBe('input')
    })

    it('should merge overrides with defaults', () => {
      const overrides = {
        key: 'status',
        label: '状态',
        type: 'select' as const,
        options: [
          { label: '启用', value: 1 },
          { label: '禁用', value: 0 },
        ],
      }

      const config = createDefaultSearchFieldConfig(overrides)
      
      expect(config.key).toBe('status')
      expect(config.type).toBe('select')
      expect(config.options).toHaveLength(2)
    })
  })

  describe('createDefaultTableConfig', () => {
    it('should create default table config', () => {
      const config = createDefaultTableConfig()
      
      expect(config.columns).toEqual([])
      expect(config.size).toBe('middle')
      expect(config.bordered).toBe(false)
      expect(config.searchable).toBe(true)
      expect(config.pagination).toBeDefined()
      expect(config.pagination?.pageSize).toBe(10)
    })

    it('should merge overrides with defaults', () => {
      const overrides = {
        columns: [
          {
            key: 'name',
            title: '姓名',
            dataIndex: 'name',
          },
        ],
        size: 'large' as const,
        bordered: true,
      }

      const config = createDefaultTableConfig(overrides)
      
      expect(config.columns).toHaveLength(1)
      expect(config.size).toBe('large')
      expect(config.bordered).toBe(true)
      expect(config.searchable).toBe(true) // 保持默认值
    })

    it('should handle nested config overrides', () => {
      const overrides = {
        pagination: {
          pageSize: 20,
          showSizeChanger: false,
        },
      }

      const config = createDefaultTableConfig(overrides)
      
      expect(config.pagination?.pageSize).toBe(20)
      expect(config.pagination?.showSizeChanger).toBe(false)
      expect(config.pagination?.showQuickJumper).toBe(true) // 保持默认值
    })
  })

  describe('createDefaultFormConfig', () => {
    it('should create default form config', () => {
      const config = createDefaultFormConfig()
      
      expect(config.fields).toEqual([])
      expect(config.layout).toBe('horizontal')
      expect(config.size).toBe('middle')
      expect(config.resetable).toBe(true)
      expect(config.labelCol?.span).toBe(6)
      expect(config.wrapperCol?.span).toBe(18)
    })

    it('should merge overrides with defaults', () => {
      const overrides = {
        fields: [
          {
            key: 'name',
            name: 'name',
            label: '姓名',
            type: 'input' as const,
          },
        ],
        layout: 'vertical' as const,
        size: 'small' as const,
      }

      const config = createDefaultFormConfig(overrides)
      
      expect(config.fields).toHaveLength(1)
      expect(config.layout).toBe('vertical')
      expect(config.size).toBe('small')
      expect(config.resetable).toBe(true) // 保持默认值
    })
  })

  describe('createDefaultSearchConfig', () => {
    it('should create default search config', () => {
      const config = createDefaultSearchConfig()
      
      expect(config.fields).toEqual([])
      expect(config.layout).toBe('horizontal')
      expect(config.collapsible).toBe(false)
      expect(config.defaultCollapsed).toBe(false)
    })

    it('should merge overrides with defaults', () => {
      const overrides = {
        fields: [
          {
            key: 'name',
            label: '姓名',
            type: 'input' as const,
          },
        ],
        layout: 'inline' as const,
        collapsible: true,
      }

      const config = createDefaultSearchConfig(overrides)
      
      expect(config.fields).toHaveLength(1)
      expect(config.layout).toBe('inline')
      expect(config.collapsible).toBe(true)
      expect(config.defaultCollapsed).toBe(false) // 保持默认值
    })
  })
})

describe('Config Builders', () => {
  describe('TableConfigBuilder', () => {
    it('should build table config using fluent API', () => {
      const config = new TableConfigBuilder()
        .addColumn({
          key: 'name',
          title: '姓名',
          dataIndex: 'name',
        })
        .addColumn({
          key: 'email',
          title: '邮箱',
          dataIndex: 'email',
        })
        .searchable(true)
        .exportable(true)
        .selectable('multiple')
        .size('large')
        .bordered(true)
        .build()

      expect(config.columns).toHaveLength(2)
      expect(config.searchable).toBe(true)
      expect(config.exportable).toBe(true)
      expect(config.selectable).toBe('multiple')
      expect(config.size).toBe('large')
      expect(config.bordered).toBe(true)
    })

    it('should set actions config', () => {
      const config = new TableConfigBuilder()
        .columns([])
        .actions({
          key: 'actions',
          actions: [
            {
              key: 'edit',
              label: '编辑',
              onClick: () => {},
            },
          ],
        })
        .build()

      expect(config.actions).toBeDefined()
      expect(config.actions?.actions).toHaveLength(1)
    })

    it('should set pagination config', () => {
      const config = new TableConfigBuilder()
        .columns([])
        .pagination({
          pageSize: 20,
          showSizeChanger: false,
        })
        .build()

      expect(config.pagination?.pageSize).toBe(20)
      expect(config.pagination?.showSizeChanger).toBe(false)
    })

    it('should disable pagination', () => {
      const config = new TableConfigBuilder()
        .columns([])
        .pagination(false)
        .build()

      expect(config.pagination).toBeUndefined()
    })

    it('should set batch actions', () => {
      const config = new TableConfigBuilder()
        .columns([])
        .batchActions([
          {
            key: 'delete',
            label: '批量删除',
            type: 'danger',
            onClick: () => {},
          },
        ])
        .build()

      expect(config.batchActions).toHaveLength(1)
      expect(config.batchActions?.[0].type).toBe('danger')
    })
  })

  describe('FormConfigBuilder', () => {
    it('should build form config using fluent API', () => {
      const config = new FormConfigBuilder()
        .addField({
          key: 'name',
          name: 'name',
          label: '姓名',
          type: 'input',
          required: true,
        })
        .addField({
          key: 'email',
          name: 'email',
          label: '邮箱',
          type: 'input',
        })
        .layout('vertical')
        .size('small')
        .resetable(false)
        .build()

      expect(config.fields).toHaveLength(2)
      expect(config.layout).toBe('vertical')
      expect(config.size).toBe('small')
      expect(config.resetable).toBe(false)
    })

    it('should set label and wrapper columns', () => {
      const config = new FormConfigBuilder()
        .fields([])
        .labelCol({ span: 4 })
        .wrapperCol({ span: 20 })
        .build()

      expect(config.labelCol?.span).toBe(4)
      expect(config.wrapperCol?.span).toBe(20)
    })

    it('should set initial values', () => {
      const initialValues = { name: 'John', email: 'john@example.com' }
      
      const config = new FormConfigBuilder()
        .fields([])
        .initialValues(initialValues)
        .build()

      expect(config.initialValues).toEqual(initialValues)
    })

    it('should set event callbacks', () => {
      const onFinish = vi.fn()
      const onValuesChange = vi.fn()
      
      const config = new FormConfigBuilder()
        .fields([])
        .onFinish(onFinish)
        .onValuesChange(onValuesChange)
        .build()

      expect(config.onFinish).toBe(onFinish)
      expect(config.onValuesChange).toBe(onValuesChange)
    })
  })

  describe('SearchConfigBuilder', () => {
    it('should build search config using fluent API', () => {
      const config = new SearchConfigBuilder()
        .addField({
          key: 'name',
          label: '姓名',
          type: 'input',
        })
        .addField({
          key: 'status',
          label: '状态',
          type: 'select',
          options: [
            { label: '启用', value: 1 },
            { label: '禁用', value: 0 },
          ],
        })
        .layout('inline')
        .collapsible(true)
        .defaultCollapsed(true)
        .build()

      expect(config.fields).toHaveLength(2)
      expect(config.layout).toBe('inline')
      expect(config.collapsible).toBe(true)
      expect(config.defaultCollapsed).toBe(true)
    })
  })

  describe('Factory functions', () => {
    it('should create table builder', () => {
      const builder = createTableBuilder()
      expect(builder).toBeInstanceOf(TableConfigBuilder)
    })

    it('should create form builder', () => {
      const builder = createFormBuilder()
      expect(builder).toBeInstanceOf(FormConfigBuilder)
    })

    it('should create search builder', () => {
      const builder = createSearchBuilder()
      expect(builder).toBeInstanceOf(SearchConfigBuilder)
    })

    it('should create builders with initial config', () => {
      const initialConfig = {
        columns: [
          {
            key: 'name',
            title: '姓名',
            dataIndex: 'name',
          },
        ],
      }

      const builder = createTableBuilder(initialConfig)
      const config = builder.build()
      
      expect(config.columns).toHaveLength(1)
    })
  })
})