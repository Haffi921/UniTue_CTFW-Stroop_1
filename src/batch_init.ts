function CopyJsonInputToBatch() {
  let error_counter = 0;
  const data = {
    participants_finished: 0,
  };
  const dataFields = Object.keys(data);

  function initBatchData(key, value) {
    if (!jatos.batchSession.defined("/" + key)) {
      return jatos.batchSession.set(key, value);
    }
    return Promise.resolve();
  }

  function CopyKeyValue(index) {
    if (index < dataFields.length) {
      const key = dataFields[index];
      initBatchData(key, data[key])
        .then(function () {
          error_counter = 0;
          CopyKeyValue(index + 1);
        })
        .catch(function (e) {
          error_counter += 1;
          if (error_counter > 2) {
            console.error(e);
            return;
          }
          CopyKeyValue(index);
        });
    }
  }

  CopyKeyValue(0);
}

jatos.onLoad(function () {
  CopyJsonInputToBatch();
  jatos.startNextComponent(
    null,
    jatos.urlQueryParameters.PROLIFIC_PID.substring(0, 6)
  );
});
