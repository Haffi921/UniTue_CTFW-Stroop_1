function select_group(): number {
  const groups: number[] = jatos.batchSession
    .get("condition-bool")
    .reduce((open_groups: number[], a: boolean, i: number) => {
      if (a) open_groups.push(i);
      return open_groups;
    }, []);

  let selected_group: number =
    groups[Math.floor(Math.random() * groups.length)];

  return selected_group;
}

jatos.onLoad(function () {
  jatos.studySessionData.group = select_group();
  jatos.startNextComponent(null, `Group ${jatos.studySessionData.group + 1}`);
});
