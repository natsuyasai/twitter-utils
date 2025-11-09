import type { Meta, StoryObj } from '@storybook/react';
import AutoReload from './AutoReload';

const meta = {
  title: 'Content Scripts/AutoReload',
  component: AutoReload,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Twitter/X自動リロードコンポーネント。タブの自動再選択により、タイムラインを定期的に更新します。',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof AutoReload>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * デフォルトの状態。
 * 自動リロードが有効で、5分間隔に設定されています。
 */
export const Default: Story = {};

/**
 * 基本的な使い方:
 * - ●ボタン: コントロールパネルの表示/非表示を切り替え
 * - ON/OFFボタン: 自動リロードの一時停止/再開
 * - セレクトボックス: リロード間隔を5秒〜10分の範囲で設定
 *
 * 動作:
 * - スクロール中は自動的に無効化（●が灰色）
 * - 対象URL（ホーム、通知、検索）でのみ有効
 */
export const Interactive: Story = {
  parameters: {
    docs: {
      description: {
        story: '実際のUIを操作して動作を確認できます。スクロールイベントやURL変更の検知は、実際のTwitter/Xページでのみ動作します。',
      },
    },
  },
};

/**
 * スタイルの確認用。
 * コンポーネントの視覚的な外観を確認できます。
 */
export const StyleGuide: Story = {
  parameters: {
    docs: {
      description: {
        story: 'コンポーネントのスタイリングを確認できます。固定位置（top: 40px, left: 0）に配置され、半透明の影付きボタンが特徴です。',
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '100vw', height: '100vh', position: 'relative', background: '#f5f5f5' }}>
        <Story />
      </div>
    ),
  ],
};

/**
 * ダークモード環境でのプレビュー。
 */
export const DarkMode: Story = {
  parameters: {
    backgrounds: {
      default: 'dark',
    },
    docs: {
      description: {
        story: 'ダークモード環境でのコンポーネントの表示を確認できます。',
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '100vw', height: '100vh', position: 'relative', background: '#15202b' }}>
        <Story />
      </div>
    ),
  ],
};

/**
 * モバイルビューポート。
 * 小さな画面でも適切に表示されることを確認できます。
 */
export const Mobile: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    docs: {
      description: {
        story: 'モバイルデバイスでの表示を確認できます。',
      },
    },
  },
};
