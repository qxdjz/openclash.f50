var obj = { dns: { enable: true, port: 53, names: { a: 1, b: [12, 23] } } };

var js = `set("dns/enable", false);
  del("dns/port");
  append("dns/ab/c", { i: 1 });
  append("dns/names", { a: 3 });
  insert("dns/names/b", [34, 56]);`;

eval(`(function main(config) {
  function set(key, value) {
    if (!key || key.length === 0) {
      return;
    }
    var ks = key.split("/");
    var temp = config;
    for (var i = 0; i < ks.length - 1; i++) {
      if (temp[ks[i]]) {
        temp = temp[ks[i]];
        continue;
      }
      temp[ks[i]] = {};
      temp = temp[ks[i]];
    }
    temp[ks[ks.length - 1]] = value;
  }

  function del(key) {
    if (!key || key.length === 0) {
      return;
    }
    var ks = key.split("/");
    var temp = config;
    for (var i = 0; i < ks.length - 1; i++) {
      if (!temp[ks[i]]) {
        return;
      }
      temp = temp[ks[i]];
    }
    delete temp[ks[ks.length - 1]];
  }

  function obj(type, key, value) {
    if (!key || key.length === 0) {
      return;
    }
    var ks = key.split("/");
    var temp = config;
    for (var i = 0; i < ks.length - 1; i++) {
      if (temp[ks[i]]) {
        temp = temp[ks[i]];
        continue;
      }
      temp[ks[i]] = {};
      temp = temp[ks[i]];
    }
    if (temp[ks[ks.length - 1]]) {
      if (type === "insert") {
        temp[ks[ks.length - 1]] = { ...value, ...temp[ks[ks.length - 1]] };
      }
      if (type === "append") {
        temp[ks[ks.length - 1]] = { ...temp[ks[ks.length - 1]], ...value };
      }
    } else {
      temp[ks[ks.length - 1]] = value;
    }
  }

  function arr(type, key, value) {
    if (!key || key.length === 0) {
      return;
    }
    var ks = key.split("/");
    var temp = config;
    for (var i = 0; i < ks.length - 1; i++) {
      if (temp[ks[i]]) {
        temp = temp[ks[i]];
        continue;
      }
      temp[ks[i]] = {};
      temp = temp[ks[i]];
    }
    if (temp[ks[ks.length - 1]]) {
      if (type === "insert") {
        temp[ks[ks.length - 1]] = [...value, ...temp[ks[ks.length - 1]]];
      }
      if (type === "append") {
        temp[ks[ks.length - 1]] = [...temp[ks[ks.length - 1]], ...value];
      }
    } else {
      temp[ks[ks.length - 1]] = value;
    }
  }

  function insert(key, value) {
    if (Array.isArray(value)) {
      arr("insert", key, value);
    } else {
      obj("insert", key, value);
    }
  }

  function append(key, value) {
    if (Array.isArray(value)) {
      arr("append", key, value);
    } else {
      obj("append", key, value);
    }
  }

  ${js}
})`)(obj);

console.log(JSON.stringify(obj));
