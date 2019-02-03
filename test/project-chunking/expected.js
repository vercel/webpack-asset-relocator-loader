(function (output) {
  expect(output.length).toBe(15);
  expect(output[5].trim().substr(0, 9)).toBe("asset.txt");
  expect(output[6].trim().substr(0, 10)).toBe("asset1.txt");
})