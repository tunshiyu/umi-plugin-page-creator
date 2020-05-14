import React, { useContext, useState } from 'react';
import { Form, Button, Card, message, Input } from 'antd';
import Title from '../../../../../components/Title';
import renderFormItem from '../../../../../components/FormItemConfig';
import FormItemsDrawer from '../../../../../components/FormItemsDrawer';
import { FormItemType, AjaxResponse } from '../../../../../interfaces/common';
import FormItemConfigDrawer from '../../../../../components/FormItemConfigDrawer';
import Context from '../../../Context';
import DropdownActions from '../../../../../components/DropdownActions';
import { Store } from 'antd/lib/form/interface';
import ShortFormConfigDrawer from '../../drawers/ShortFormConfigDrawer';
import useFormItem from '../../../../../hooks/useFormItem';
import produce from 'immer';
import faker from 'faker';
import styles from './index.module.less';
import useConfigVisible from '../../../../../hooks/useConfigVisible';
import ConfigActions from '../../../../../components/ConfigActions';

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 7 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 12 },
    md: { span: 10 },
  },
};

export default () => {
  const { api } = useContext(Context);
  const [cardConfig, setCardConfig] = useState<Store>({
    title: '单列详情',
  });

  const {
    formItemsDrawerVisible,
    pathModalVisible,
    formConfigDrawerVisible,
    formItemConfigDrawerVisible,
    setFormItemsDrawerVisible,
    setPathModalVisible,
    setFormConfigDrawerVisible,
    setFormItemConfigDrawerVisible,
  } = useConfigVisible();

  const {
    formItems,
    setFormItems,
    moveUp,
    moveDown,
    configItem,
    deleteItem,
    copyItem,
    currentItem,
    index,
    onConfirm,
  } = useFormItem();

  /**
   * 添加详情展示项
   */
  const addDetailItem = () => {
    setFormItems(
      produce(formItems, draft => {
        draft.push({
          label: faker.name.title(),
          name: faker.name.lastName(),
          type: 'input',
        });
      }),
    );
  };

  /**
   * 把配置的表单信息和添加的表单项配置传到服务端
   */
  const remoteCall = async (path: string) => {
    // 对formItems进行遍历，如果其中有任一项没有配置label/name，则不允许提交
    if (formItems.length === 0) {
      message.error('您还没有添加详情展示项，不能提交！');
      return;
    }
    try {
      const result = await api.callRemote({
        type: 'org.umi-plugin-page-creator.shortDetail',
        payload: {
          cardConfig,
          formItems,
          path,
        },
      });
      message.success((result as AjaxResponse<string>).message);
      setPathModalVisible(false);
    } catch (error) {
      message.error(error.message);
    }
  };

  return (
    <>
      <Card
        title={<Title text={cardConfig.title} />}
        extra={
          <Button type="primary" onClick={() => setFormConfigDrawerVisible(true)}>
            配置
          </Button>
        }
      >
        <Form {...formItemLayout}>
          {formItems.map((formItem, index) => (
            <div className={styles.formItemConfig}>
              <ConfigActions
                moveUp={moveUp(index)}
                moveDown={moveDown(index)}
                configItem={() => {
                  configItem(formItem, index);
                  setFormItemConfigDrawerVisible(true);
                }}
                deleteItem={deleteItem(index)}
                copyItem={copyItem(index)}
              />
              <Form.Item label={formItem.label} name={formItem.name}>
                <Input disabled />
              </Form.Item>
            </div>
          ))}
          <Button onClick={addDetailItem} type="dashed" style={{ width: '100%', marginBottom: 32 }}>
            添加展示项
          </Button>
        </Form>
      </Card>

      {/**表单配置 */}
      <ShortFormConfigDrawer
        visible={formConfigDrawerVisible}
        setVisible={setFormConfigDrawerVisible}
        onFinish={setCardConfig}
      />

      {/**配置单个表单项 */}
      {currentItem && (
        <FormItemConfigDrawer
          visible={formItemConfigDrawerVisible}
          onVisible={setFormItemConfigDrawerVisible}
          index={index}
          formItem={currentItem}
          onConfirm={onConfirm}
          from="detail"
        />
      )}

      {/**提交时候弹出的输入文件路径 */}
      <DropdownActions
        onRemoteCall={remoteCall}
        modalVisible={pathModalVisible}
        setModalVisible={setPathModalVisible}
      />
    </>
  );
};