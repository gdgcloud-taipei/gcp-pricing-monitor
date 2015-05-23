# gcp-pricing-monitor
This is a Apps Script program that will monitor the GCP pricing json file that provided by GCP calculator. 

## Usage

Step 1: 準備Spreadsheet
建立您自己的Google Spreadsheet，並且建立兩個Tab: "Change Log", "Form Responses 1"，其中Change Log是紀錄有Change的狀況，Form Tab是登陸需要被通知的人員姓名與Email

Step 2: 建立Apps Script Code
從Spreadsheet中開啟指令碼編輯器，然後直接複製Code.gs的內容複製貼到您的編輯器中，該程式碼中run()即是整支程式的啟動點。

Step 3: 掛上排程器
從指令碼編輯器中，選擇Resources > Current Project's Triggers中開啟排程器，並指定監控時間... 這邊建議一天一次就好。

## Others

如果您要進一步開放註冊通知的話，可以透過Google Form整合Form的輸入到"Form Responses 1"，欄位設定如下：

https://docs.google.com/a/mitac.com.tw/forms/d/1xoxOJonT9uBs3uF6b-dO-qK-_hjD1mKriTCEqB4fY4g/viewform

如果懶得自己做的話，可以直接註冊上面的表單，我會讓它持續執行下去 :D
