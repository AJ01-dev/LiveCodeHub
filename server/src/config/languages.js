// Judge0 language IDs
export const LANGUAGE_MAP = {
  javascript: { id: 63, name: 'JavaScript', monaco: 'javascript' },
  python: { id: 71, name: 'Python', monaco: 'python' },
  java: { id: 62, name: 'Java', monaco: 'java' },
  cpp: { id: 54, name: 'C++', monaco: 'cpp' },
};

export const DEFAULT_CODE = {
  javascript: `// Welcome to CodeCollab!
function greet(name) {
  console.log("Hello, " + name + "!");
}

greet("World");
`,
  python: `# Welcome to CodeCollab!
def greet(name):
    print(f"Hello, {name}!")

greet("World")
`,
  java: `// Welcome to CodeCollab!
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}
`,
  cpp: `// Welcome to CodeCollab!
#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    return 0;
}
`,
};

export const getLanguageById = (id) => {
  return Object.entries(LANGUAGE_MAP).find(([, lang]) => lang.id === id)?.[0] || 'javascript';
};

export const getLanguageId = (language) => {
  return LANGUAGE_MAP[language]?.id || 63;
};
