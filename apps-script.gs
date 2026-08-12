function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("Respostas");
    if (!sheet) {
      sheet = ss.insertSheet("Respostas");
      sheet.appendRow([
        "Atualizado em", "Equipe", "Assessor", "Semana",
        "% 1:1 de Resultados", "% Indicadores", "Quadrante",
        "Captação líquida (R$ mil)", "Receita na semana (R$)",
        "Modelo de servir", "Ata / Plano de ação"
      ]);
      sheet.setFrozenRows(1);
    }

    var key = (data.equipe || "") + "||" + (data.nome || "") + "||" + (data.weekKey || "");
    var values = sheet.getDataRange().getValues();
    var rowIndex = -1;
    for (var i = 1; i < values.length; i++) {
      var rowKey = values[i][1] + "||" + values[i][2] + "||" + values[i][3];
      if (rowKey === key) { rowIndex = i + 1; break; }
    }

    var row = [
      new Date(),
      data.equipe || "",
      data.nome || "",
      data.weekKey || "",
      data.pct1a1 != null ? data.pct1a1 : "",
      data.pctIndicadores != null ? data.pctIndicadores : "",
      data.quadrante || "",
      data.captacao != null ? data.captacao : "",
      data.receita != null ? data.receita : "",
      data.modeloServir != null ? data.modeloServir : "",
      data.ata || ""
    ];

    if (rowIndex === -1) {
      sheet.appendRow(row);
    } else {
      sheet.getRange(rowIndex, 1, 1, row.length).setValues([row]);
    }

    return ContentService.createTextOutput(JSON.stringify({ status: "ok" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({ status: "ok - use POST" }))
    .setMimeType(ContentService.MimeType.JSON);
}
