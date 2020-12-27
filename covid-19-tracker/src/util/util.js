export const sortData = (data) => {
  const sortedData = [...data];
  // console.log("SORTED!");
  // console.log(sortedData);

  // sortedData.sort((a, b) => {
  //   if (a.cases > b.cases) {
  //     return -1;
  //   } else {
  //     return 1;
  //   }
  // });

  sortedData.sort((a, b) => a.cases > b.cases ? -1 : 1 );

  return sortedData;
};