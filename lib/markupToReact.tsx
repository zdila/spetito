import { Link } from "@mui/material";
import { cloneElement, Fragment, isValidElement, ReactNode } from "react";

type Ref = {
  op: string;
  [key: string]: any;
};

type Tree = { type: "ol" | "ul"; items: (string | Tree)[] };

// https://mathiasbynens.be/demo/url-regex -> https://gist.github.com/dperini/729294
// prettier-ignore
const urlRegExp = new RegExp(
    // protocol identifier (optional)
    // short syntax // still required
    "((?:https?:)?\\/\\/)?" +
    // user:pass BasicAuth (optional)
    "(?:\\S+(?::\\S*)?@)?" +
    "(?:" +
      // IP address exclusion
      // private & local networks
      "(?!(?:10|127)(?:\\.\\d{1,3}){3})" +
      "(?!(?:169\\.254|192\\.168)(?:\\.\\d{1,3}){2})" +
      "(?!172\\.(?:1[6-9]|2\\d|3[0-1])(?:\\.\\d{1,3}){2})" +
      // IP address dotted notation octets
      // excludes loopback network 0.0.0.0
      // excludes reserved space >= 224.0.0.0
      // excludes network & broadcast addresses
      // (first & last IP address of each class)
      "(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])" +
      "(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}" +
      "(?:\\.(?:[1-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))" +
    "|" +
      // host & domain names, may end with dot
      // can be replaced by a shortest alternative
      // (?![-_])(?:[-\\w\\u00a1-\\uffff]{0,63}[^-_]\\.)+
      "(?:" +
        "(?:" +
          "[a-z0-9\\u00a1-\\uffff]" +
          "[a-z0-9\\u00a1-\\uffff_-]{0,62}" +
        ")?" +
        "[a-z0-9\\u00a1-\\uffff]\\." +
      ")+" +
      // TLD identifier name, may end with dot
      "(?:[a-z\\u00a1-\\uffff]{2,}\\.?)" +
    ")" +
    // port number (optional)
    "(?::\\d{2,5})?" +
    // resource path (optional)
    "(?:[/?#]\\S*)?", "gi"
);

// https://en.wikipedia.org/wiki/List_of_emoticons
function replaceIcons(str: string) {
  return str
    .replace(/(?<!\\):-?\)/g, "🙂")
    .replace(/(?<!\\):'-?\)/g, "🥲")
    .replace(/(?<!\\):-?\(/g, "🙁")
    .replace(/(?<!\\):'-?\(/g, "😢")
    .replace(/(?<!\\):-?P/g, "😛")
    .replace(/(?<!\\):-?D/g, "😃")
    .replace(/(?<!\\):-?[Oo]/g, "😮")
    .replace(/(?<!\\);-?\)/g, "😉")
    .replace(/(?<!\\);-?P/g, "😜")
    .replace(/(?<!\\);-?P/g, "😜")
    .replace(/(?<!\\):-?\*/g, "😘")
    .replace(/(?<!\\)\<3/g, "❤️")
    .replace(/(?<!\\)\(y\)/g, "👍")
    .replace(/(?<!\\)\(n\)/g, "👎")
    .replace(/(?<!\\)\(i\)/g, "ℹ️")
    .replace(/(?<!\\)\(\/\)/g, "✅")
    .replace(/(?<!\\)\(\x\)/g, "❌")
    .replace(/(?<!\\)\(!\)/g, "⚠️")
    .replace(/(?<!\\)\(\?\)/g, "❓")
    .replace(/(?<!\\)\(flag\)/g, "🚩")
    .replace(/\\\\/g, "\\");
}

export function markupToReact(str: string) {
  const refs: (Ref | undefined)[] = [];

  const res = markupToReactInt(str, true);

  return replace(res);

  function replace(res: string) {
    let last = 0;

    const nodes: ReactNode[] = [];

    // eslint-disable-next-line no-control-regex
    for (const m of res.matchAll(/\u0002(\d+)\u0003/g)) {
      if (m.index) {
        nodes.push(replaceIcons(res.slice(last, m.index)));
      }

      const ref = refs[Number(m[1])];

      if (!ref) {
        throw new Error();
      }

      if (ref.op === "b") {
        nodes.push(<b>{replace(ref.content)}</b>);
      } else if (ref.op === "i") {
        nodes.push(<i>{replace(ref.content)}</i>);
      } else if (ref.op === "p") {
        nodes.push(<p>{replace(ref.content)}</p>);
      } else if (ref.op === "ins") {
        nodes.push(<ins>{replace(ref.content)}</ins>);
      } else if (ref.op === "del") {
        nodes.push(<del>{replace(ref.content)}</del>);
      } else if (ref.op === "tt") {
        nodes.push(
          <span style={{ fontFamily: "monospace" }}>{ref.content}</span>
        );
      } else if (ref.op === "cite") {
        nodes.push(<cite>{ref.content}</cite>);
      } else if (ref.op === "noformat") {
        nodes.push(<pre>{ref.content}</pre>);
      } else if (ref.op === "quote") {
        nodes.push(
          <blockquote style={{ whiteSpace: "pre" }}>{ref.content}</blockquote>
        );
      } else if (ref.op === "sub") {
        nodes.push(<sub>{replace(ref.content)}</sub>);
      } else if (ref.op === "sup") {
        nodes.push(<sup>{replace(ref.content)}</sup>);
      } else if (ref.op === "bq") {
        nodes.push(<blockquote>{replace(ref.content)}</blockquote>);
      } else if (ref.op === "simpleList") {
        nodes.push(
          <ul>
            {(ref.contents as string[]).map((item, i) => (
              <li key={i}>{replace(item)}</li>
            ))}
          </ul>
        );
      } else if (ref.op === "list") {
        let key = 0;

        const render = (tree: Tree) => {
          const content: ReactNode[] = [];

          let bunch: ReactNode[] = [];

          for (const item of tree.items) {
            if (typeof item === "string") {
              bunch.push(replace(item));

              content.push(<li key={key++}>{bunch}</li>);

              bunch = [];
            } else {
              content.push(render(item));
            }
          }

          if (bunch.length) {
            content.push(<li key={key++}>{bunch}</li>);
          }

          return tree.type === "ol" ? (
            <ol key={key++}>{content}</ol>
          ) : (
            <ul key={key++}>{content}</ul>
          );
        };

        nodes.push(render(ref.tree));
      } else if (ref.op === "color") {
        nodes.push(
          <span style={{ color: ref.color }}>{replace(ref.content)}</span>
        );
      } else if (ref.op === "link") {
        nodes.push(
          <Link href={ref.href} target="_blank" rel="noopener noreferrer">
            {replace(ref.content)}
          </Link>
        );
      } else if (ref.op === "bareLink") {
        nodes.push(
          <Link href={ref.href} target="_blank" rel="noopener noreferrer">
            {ref.href}
          </Link>
        );
      }

      last = (m.index ?? 0) + m[0].length;
    }

    nodes.push(replaceIcons(res.slice(last)));

    return (
      <Fragment>
        {nodes.map((el, i) =>
          isValidElement(el) ? cloneElement(el, { key: i }) : el
        )}
      </Fragment>
    );
  }

  function markupToReactInt(str: string, paragraphs = false) {
    str = markupToReactPart(str, /(?<!\\)```(.*?)(?<!\\)```/gs, (m) => ({
      op: "noformat",
      content: m[1],
    }));

    str = markupToReactPart(str, /^bq\. (.*)/gm, (m) => ({
      op: "bq",
      content: markupToReactInt(m[1]),
    }));

    str = markupToReactPart(str, /^- .*(?:\n^- .*)*/gm, (m) => ({
      op: "simpleList",
      contents: m[0].split("\n").map((line) => markupToReactInt(line.slice(2))),
    }));

    str = markupToReactPart(str, /^[*#]+ .*(?:\n^[*#]+ .*)*/gs, (m) => {
      function walkTree(lines: string[], pos: number) {
        const tree: Tree = {
          type: lines[0].charAt(pos - 1) === "#" ? "ol" : "ul",
          items: [],
        };

        let nested: string[] = [];

        for (const line of lines) {
          const depth = line.indexOf(" ");

          if (depth === pos) {
            if (nested.length) {
              tree.items.push(walkTree(nested, pos + 1));

              nested = [];
            }

            tree.items.push(markupToReactInt(line.slice(pos + 1)));
          } else if (depth > pos) {
            nested.push(line);
          }
        }

        if (nested.length) {
          tree.items.push(walkTree(nested, pos + 1));
        }

        return tree;
      }

      return {
        op: "list",
        tree: walkTree(m[0].split("\n"), 1),
      };
    });

    if (paragraphs) {
      // eslint-disable-next-line no-control-regex
      str = markupToReactPart(
        str,
        /(?:^|(?<=\n\n))([^\u0002\u0003]*?)(\n\n|$)/gs,
        (m) => ({
          op: "p",
          content: markupToReactInt(m[1]),
        })
      );
    }

    str = str.replace(/(?<!\\)!(.*?)(?<!\\)!/g, ""); // remove images

    str = markupToReactPart(str, /(?<!\\)`(.*?)(?<!\\)`/g, (m) => ({
      op: "tt",
      content: m[1],
    }));

    str = markupToReactPart(str, /(?<!\\)\*(.*?)(?<!\\)\*/g, (m) => ({
      op: "b",
      content: markupToReactInt(m[1]),
    }));

    str = markupToReactPart(str, /(?<!\\)_(.*?)(?<!\\)_/g, (m) => ({
      op: "i",
      content: markupToReactInt(m[1]),
    }));

    str = markupToReactPart(str, /(?<!\\)\+(.*?)(?<!\\)\+/g, (m) => ({
      op: "ins",
      content: markupToReactInt(m[1]),
    }));

    str = markupToReactPart(str, /(?<!\\)-(.*?)(?<!\\)-/g, (m) => ({
      op: "del",
      content: markupToReactInt(m[1]),
    }));

    str = markupToReactPart(str, /(?<!\\)~(.*?)(?<!\\)~/g, (m) => ({
      op: "sub",
      content: markupToReactInt(m[1]),
    }));

    str = markupToReactPart(str, /(?<!\\)\^(.*?)(?<!\\)\^/g, (m) => ({
      op: "sup",
      content: markupToReactInt(m[1]),
    }));

    str = markupToReactPart(str, /(?<!\\)\?\?(.*?)(?<!\\)\?\?/g, (m) => ({
      op: "cite",
      content: markupToReactInt(m[1]),
    }));

    str = markupToReactPart(
      str,
      /(?<!\\)\{color:(.+?)\}(.*?)(?<!\\)\{color\}/gs,
      (m) => ({
        op: "color",
        content: markupToReactInt(m[2]),
        color: m[1],
      })
    );

    str = markupToReactPart(
      str,
      /(?<!\\)\{quote\}(.*?)(?<!\\)\{quote\}/gs,
      (m) => ({
        op: "quote",
        content: markupToReactInt(m[1]),
      })
    );

    str = markupToReactPart(str, /(?<!\\)\[(.+?)\|(.+?)(?<!\\)\]/g, (m) => ({
      op: "link",
      href: m[2],
      content: markupToReactInt(m[1]),
    }));

    str = markupToReactPart(
      str,
      // // https://stackoverflow.com/a/3809435/289827
      // /(?:https?:\/\/)?([-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?)/gi,
      urlRegExp,
      (m) => ({
        op: "link",
        href: m[1] ? m[0] : "https://" + m[0],
        content: m[0],
      })
    );

    str = markupToReactPart(str, /(?<!\\)\[(\S+?)(?<!\\)\]/g, (m) => ({
      op: "bareLink",
      href: m[1],
    }));

    return str;
  }

  function markupToReactPart(
    str: string,
    regex: RegExp,
    mkRef: (m: RegExpMatchArray) => Ref
  ) {
    let last = 0;

    const result: string[] = [];

    for (const m of str.matchAll(regex)) {
      if (m.index !== undefined) {
        result.push(str.slice(last, m.index));
      }

      const i = refs.length;

      result.push(`\u0002${i}\u0003`);

      refs.push(undefined);

      refs[i] = mkRef(m);

      last = (m.index ?? 0) + m[0].length;
    }

    result.push(str.slice(last));

    return result.join("");
  }
}

/* SAMPLE:
h2. My monitor went black

*bbb_iii_bbb*

```
preformatted piece of text
    so *no* further _formatting_ is done here
```

*bold1*

_italic_

+underline+

-strikethrough-

~subscript~

^superscript^

- foo
- bar
- baz

{{code segment}}

{{2022-03-22}}

{color:#97a0af}different {color}{color:#6554c0}colored {color}{color:#00b8d9}text{color}

* l1
** l2
** l3
*** l4
** l5
* l6
** l7

* bulleted list

# numbered list
# [Change link name|https://ossapps.atlassian.net/browse/CC-1021]

!Screen Shot 2022-03-21 at 10.43.53 AM.png|width=1903,height=904!


😀

{noformat}code block{noformat}

----

{quote}quote block{quote}

{color:#FF5630}*[ STATUS LOZENGE ]*{color}

*strong* _emphasis_ ??citation?? -del\\-eted- +inserted+ ^superscript^ ~subscript~ {{monospaced}}

*strong* _emphasis_ ??citation?? -del\\-eted- +inserted+ ^superscript^ ~subscript~ {{monospaced}}

*strong* _emphasis_ ??citation?? -del\\-eted- +inserted+ ^superscript^ ~subscript~ {{monospaced}}

bq. Some block quoted text

{quote}
    here is quotable
    content to be quoted
{quote}

{color:red}
    look ma, red text!
{color}

||heading 1||heading 2||heading 3||
|col A1|col A2|col A3|
|col B1|col B2|col B3|

{color:#FF5630}*[ STATUS LOZENGE ]*{color}

{color:#6554C0}*[ PURPLE ]*{color}

{color:#00B8D9}*[ BLUE ]*{color}

{color:#FF5630}*[ RED ]*{color}

{color:#FF991F}*[ YELLOW ]*{color}

{color:#36B37E}*[ GREEN ]*{color}

{color:#97A0AF}*[ GREY ]*{color}
*/
