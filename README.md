# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## 検索画面（架空データ）

ホーム画面では曲名の部分一致、放送日、または両方を指定して検索できます。「クリア」で条件と結果を初期状態に戻します。表示する曲名と放送日はすべて架空であり、実際の放送履歴ではありません。iOSとWebでは日付を選択でき、Androidでは `YYYY-MM-DD` 形式で入力します。

検索画面とお気に入り一覧は下部タブで切り替えます。思い出メモはお気に入り一覧から開くStackの詳細画面です。検索結果のハートで曲単位のお気に入りを登録・解除できます。同じ曲の複数の放送には同じ登録状態が反映されます。お気に入りは端末内（Webではブラウザー内）に保存され、再起動・再読み込み後も維持されます。家族間の共有はありません。保存データが破損している場合は通知して空の一覧を表示し、次の登録で上書きします。読み込み・保存に失敗した場合は画面で再試行できます。

お気に入り一覧から曲ごとの思い出メモを複数登録・編集・削除できます。お気に入りを解除してもメモは端末内に残り、再登録すると表示されます。メモはAsyncStorageに暗号化せず保存され、家族間で共有されません。メモの保存データが破損した場合は、通知して自動上書きを防ぎます。保存失敗時はアプリを閉じる前に再試行してください。

思い出メモ画面では架空の放送日と放送ごとの区分を表示します。新規入力や変更中のメモがある状態で画面を離れると、入力を続けるか破棄するか確認します。編集中の変更がある場合、別のメモを編集するには保存またはキャンセルが必要です。Webの再読み込みやタブを閉じる際はブラウザー標準の確認が表示されます（ブラウザーの設定に依存します）。

アプリのフォントはZen Maru Gothicです。フォントはSIL Open Font License 1.1、`@expo-google-fonts/zen-maru-gothic`のコードはMITライセンスです。各ライセンス本文はインストール済みパッケージの `LICENSE_FONT` と `LICENSE` に含まれます。アプリの配布時は、ライセンスと著作権表示を同梱してください。

画面を追加する際は `src/app` にルートを作成します。タブ画面は `src/app/(tabs)` に配置します。従来のExploreサンプルはルート外の `src/templates` に保存しています。

検索ロジックのテストは、Node.js 26を使用して次のように実行できます。

```powershell
fnm exec --using 26.13.1 -- node --test tests\search-broadcasts.test.mjs
fnm exec --using 26.13.1 -- node --test tests\favorites.test.mjs
fnm exec --using 26.13.1 -- node --test tests\favorites-storage.test.mjs
fnm exec --using 26.13.1 -- node --test tests\memories.test.mjs
```

## Python データ解析（架空データ）

実際の放送履歴ではない架空のHTMLをローカルで解析します。実サイトやSupabaseへの接続はありません。プロジェクト直下で以下を実行してください（Windows PowerShell）。

```powershell
py -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m pytest
.\.venv\Scripts\python.exe -m scripts.data_pipeline data\test_fixtures\fictional_broadcasts.html
```

検証に通った行は `data\processed\songs.csv`、入力不備・重複などの行は `data\review\songs.csv` に出力します。後者の `validation_errors` に理由が入ります。検証に通った行も含め、すべて `review_status=pending` であり、承認や公開はされません。重複は正規化後の放送日・曲名・放送順の組み合わせで判定します。

`song_title` はHTMLから抽出した元の表記、`song_title_normalized` はUnicodeのNFKCと空白の整理を適用した表記です。元の放送日が明示されている場合は `original_broadcast_date` に保持し、未記載の場合は空欄のままです。空欄は初回放送を意味せず、再放送かどうかは推測しません。架空HTMLでは `data-original-broadcast-date` 属性で元日付を指定できます。不正な元日付は要確認CSVに分離します。

出力先に既存ファイルがある場合は上書きせずエラーになります。再実行する場合は、既存ファイルを確認したうえで `--valid-output` と `--review-output` に別のパスを指定してください。`source_url` の既定値はアクセスしない架空のURLです。テスト用HTML専用の構造であり、実サイト向けパーサーではありません。

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **src/app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **example** directory and create a blank **src/app** directory where you can start developing.

### Other setup steps

- To set up ESLint for linting, run `npx expo lint`, or follow our guide on ["Using ESLint and Prettier"](https://docs.expo.dev/guides/using-eslint/)
- If you'd like to set up unit testing, follow our guide on ["Unit Testing with Jest"](https://docs.expo.dev/develop/unit-testing/)
- Learn more about the TypeScript setup in this template in our guide on ["Using TypeScript"](https://docs.expo.dev/guides/typescript/)

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
