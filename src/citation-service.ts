import * as CSL from 'citeproc';

import type { Library } from './types';

// TODO figure out locale string import ..
// import localeEnUS from './resources/csl/locales/locales-en-US.xml';
const localeEnUS = `<?xml version="1.0" encoding="utf-8"?>
<locale xmlns="http://purl.org/net/xbiblio/csl" version="1.0" xml:lang="en-US">
  <info>
    <translator>
      <name>Andrew Dunning</name>
    </translator>
    <translator>
      <name>Sebastian Karcher</name>
    </translator>
    <translator>
      <name>Rintze M. Zelle</name>
    </translator>
    <rights license="http://creativecommons.org/licenses/by-sa/3.0/">This work is licensed under a Creative Commons Attribution-ShareAlike 3.0 License</rights>
    <updated>2015-10-10T23:31:02+00:00</updated>
  </info>
  <style-options punctuation-in-quote="true"/>
  <date form="text">
    <date-part name="month" suffix=" "/>
    <date-part name="day" suffix=", "/>
    <date-part name="year"/>
  </date>
  <date form="numeric">
    <date-part name="month" form="numeric-leading-zeros" suffix="/"/>
    <date-part name="day" form="numeric-leading-zeros" suffix="/"/>
    <date-part name="year"/>
  </date>
  <terms>
    <term name="accessed">accessed</term>
    <term name="and">and</term>
    <term name="and others">and others</term>
    <term name="anonymous">anonymous</term>
    <term name="anonymous" form="short">anon.</term>
    <term name="at">at</term>
    <term name="available at">available at</term>
    <term name="by">by</term>
    <term name="circa">circa</term>
    <term name="circa" form="short">c.</term>
    <term name="cited">cited</term>
    <term name="edition">
      <single>edition</single>
      <multiple>editions</multiple>
    </term>
    <term name="edition" form="short">ed.</term>
    <term name="et-al">et al.</term>
    <term name="forthcoming">forthcoming</term>
    <term name="from">from</term>
    <term name="ibid">ibid.</term>
    <term name="in">in</term>
    <term name="in press">in press</term>
    <term name="internet">internet</term>
    <term name="interview">interview</term>
    <term name="letter">letter</term>
    <term name="no date">no date</term>
    <term name="no date" form="short">n.d.</term>
    <term name="online">online</term>
    <term name="presented at">presented at the</term>
    <term name="reference">
      <single>reference</single>
      <multiple>references</multiple>
    </term>
    <term name="reference" form="short">
      <single>ref.</single>
      <multiple>refs.</multiple>
    </term>
    <term name="retrieved">retrieved</term>
    <term name="scale">scale</term>
    <term name="version">version</term>

    <!-- ANNO DOMINI; BEFORE CHRIST -->
    <term name="ad">AD</term>
    <term name="bc">BC</term>

    <!-- PUNCTUATION -->
    <term name="open-quote">“</term>
    <term name="close-quote">”</term>
    <term name="open-inner-quote">‘</term>
    <term name="close-inner-quote">’</term>
    <term name="page-range-delimiter">–</term>

    <!-- ORDINALS -->
    <term name="ordinal">th</term>
    <term name="ordinal-01">st</term>
    <term name="ordinal-02">nd</term>
    <term name="ordinal-03">rd</term>
    <term name="ordinal-11">th</term>
    <term name="ordinal-12">th</term>
    <term name="ordinal-13">th</term>

    <!-- LONG ORDINALS -->
    <term name="long-ordinal-01">first</term>
    <term name="long-ordinal-02">second</term>
    <term name="long-ordinal-03">third</term>
    <term name="long-ordinal-04">fourth</term>
    <term name="long-ordinal-05">fifth</term>
    <term name="long-ordinal-06">sixth</term>
    <term name="long-ordinal-07">seventh</term>
    <term name="long-ordinal-08">eighth</term>
    <term name="long-ordinal-09">ninth</term>
    <term name="long-ordinal-10">tenth</term>

    <!-- LONG LOCATOR FORMS -->
    <term name="book">
      <single>book</single>
      <multiple>books</multiple>
    </term>
    <term name="chapter">
      <single>chapter</single>
      <multiple>chapters</multiple>
    </term>
    <term name="column">
      <single>column</single>
      <multiple>columns</multiple>
    </term>
    <term name="figure">
      <single>figure</single>
      <multiple>figures</multiple>
    </term>
    <term name="folio">
      <single>folio</single>
      <multiple>folios</multiple>
    </term>
    <term name="issue">
      <single>number</single>
      <multiple>numbers</multiple>
    </term>
    <term name="line">
      <single>line</single>
      <multiple>lines</multiple>
    </term>
    <term name="note">
      <single>note</single>
      <multiple>notes</multiple>
    </term>
    <term name="opus">
      <single>opus</single>
      <multiple>opera</multiple>
    </term>
    <term name="page">
      <single>page</single>
      <multiple>pages</multiple>
    </term>
    <term name="number-of-pages">
      <single>page</single>
      <multiple>pages</multiple>
    </term>
    <term name="paragraph">
      <single>paragraph</single>
      <multiple>paragraphs</multiple>
    </term>
    <term name="part">
      <single>part</single>
      <multiple>parts</multiple>
    </term>
    <term name="section">
      <single>section</single>
      <multiple>sections</multiple>
    </term>
    <term name="sub verbo">
      <single>sub verbo</single>
      <multiple>sub verbis</multiple>
    </term>
    <term name="verse">
      <single>verse</single>
      <multiple>verses</multiple>
    </term>
    <term name="volume">
      <single>volume</single>
      <multiple>volumes</multiple>
    </term>

    <!-- SHORT LOCATOR FORMS -->
    <term name="book" form="short">
      <single>bk.</single>
      <multiple>bks.</multiple>
    </term>
    <term name="chapter" form="short">
      <single>chap.</single>
      <multiple>chaps.</multiple>
    </term>
    <term name="column" form="short">
      <single>col.</single>
      <multiple>cols.</multiple>
    </term>
    <term name="figure" form="short">
      <single>fig.</single>
      <multiple>figs.</multiple>
    </term>
    <term name="folio" form="short">
      <single>fol.</single>
      <multiple>fols.</multiple>
    </term>
    <term name="issue" form="short">
      <single>no.</single>
      <multiple>nos.</multiple>
    </term>
    <term name="line" form="short">
      <single>l.</single>
      <multiple>ll.</multiple>
    </term>
    <term name="note" form="short">
      <single>n.</single>
      <multiple>nn.</multiple>
    </term>
    <term name="opus" form="short">
      <single>op.</single>
      <multiple>opp.</multiple>
    </term>
    <term name="page" form="short">
      <single>p.</single>
      <multiple>pp.</multiple>
    </term>
    <term name="number-of-pages" form="short">
      <single>p.</single>
      <multiple>pp.</multiple>
    </term>
    <term name="paragraph" form="short">
      <single>para.</single>
      <multiple>paras.</multiple>
    </term>
    <term name="part" form="short">
      <single>pt.</single>
      <multiple>pts.</multiple>
    </term>
    <term name="section" form="short">
      <single>sec.</single>
      <multiple>secs.</multiple>
    </term>
    <term name="sub verbo" form="short">
      <single>s.v.</single>
      <multiple>s.vv.</multiple>
    </term>
    <term name="verse" form="short">
      <single>v.</single>
      <multiple>vv.</multiple>
    </term>
    <term name="volume" form="short">
      <single>vol.</single>
      <multiple>vols.</multiple>
    </term>

    <!-- SYMBOL LOCATOR FORMS -->
    <term name="paragraph" form="symbol">
      <single>¶</single>
      <multiple>¶¶</multiple>
    </term>
    <term name="section" form="symbol">
      <single>§</single>
      <multiple>§§</multiple>
    </term>

    <!-- LONG ROLE FORMS -->
    <term name="director">
      <single>director</single>
      <multiple>directors</multiple>
    </term>
    <term name="editor">
      <single>editor</single>
      <multiple>editors</multiple>
    </term>
    <term name="editorial-director">
      <single>editor</single>
      <multiple>editors</multiple>
    </term>
    <term name="illustrator">
      <single>illustrator</single>
      <multiple>illustrators</multiple>
    </term>
    <term name="translator">
      <single>translator</single>
      <multiple>translators</multiple>
    </term>
    <term name="editortranslator">
      <single>editor &amp; translator</single>
      <multiple>editors &amp; translators</multiple>
    </term>

    <!-- SHORT ROLE FORMS -->
    <term name="director" form="short">
      <single>dir.</single>
      <multiple>dirs.</multiple>
    </term>
    <term name="editor" form="short">
      <single>ed.</single>
      <multiple>eds.</multiple>
    </term>
    <term name="editorial-director" form="short">
      <single>ed.</single>
      <multiple>eds.</multiple>
    </term>
    <term name="illustrator" form="short">
      <single>ill.</single>
      <multiple>ills.</multiple>
    </term>
    <term name="translator" form="short">
      <single>tran.</single>
      <multiple>trans.</multiple>
    </term>
    <term name="editortranslator" form="short">
      <single>ed. &amp; tran.</single>
      <multiple>eds. &amp; trans.</multiple>
    </term>

    <!-- VERB ROLE FORMS -->
    <term name="container-author" form="verb">by</term>
    <term name="director" form="verb">directed by</term>
    <term name="editor" form="verb">edited by</term>
    <term name="editorial-director" form="verb">edited by</term>
    <term name="illustrator" form="verb">illustrated by</term>
    <term name="interviewer" form="verb">interview by</term>
    <term name="recipient" form="verb">to</term>
    <term name="reviewed-author" form="verb">by</term>
    <term name="translator" form="verb">translated by</term>
    <term name="editortranslator" form="verb">edited &amp; translated by</term>

    <!-- SHORT VERB ROLE FORMS -->
    <term name="director" form="verb-short">dir. by</term>
    <term name="editor" form="verb-short">ed. by</term>
    <term name="editorial-director" form="verb-short">ed. by</term>
    <term name="illustrator" form="verb-short">illus. by</term>
    <term name="translator" form="verb-short">trans. by</term>
    <term name="editortranslator" form="verb-short">ed. &amp; trans. by</term>

    <!-- LONG MONTH FORMS -->
    <term name="month-01">January</term>
    <term name="month-02">February</term>
    <term name="month-03">March</term>
    <term name="month-04">April</term>
    <term name="month-05">May</term>
    <term name="month-06">June</term>
    <term name="month-07">July</term>
    <term name="month-08">August</term>
    <term name="month-09">September</term>
    <term name="month-10">October</term>
    <term name="month-11">November</term>
    <term name="month-12">December</term>

    <!-- SHORT MONTH FORMS -->
    <term name="month-01" form="short">Jan.</term>
    <term name="month-02" form="short">Feb.</term>
    <term name="month-03" form="short">Mar.</term>
    <term name="month-04" form="short">Apr.</term>
    <term name="month-05" form="short">May</term>
    <term name="month-06" form="short">Jun.</term>
    <term name="month-07" form="short">Jul.</term>
    <term name="month-08" form="short">Aug.</term>
    <term name="month-09" form="short">Sep.</term>
    <term name="month-10" form="short">Oct.</term>
    <term name="month-11" form="short">Nov.</term>
    <term name="month-12" form="short">Dec.</term>

    <!-- SEASONS -->
    <term name="season-01">Spring</term>
    <term name="season-02">Summer</term>
    <term name="season-03">Autumn</term>
    <term name="season-04">Winter</term>
  </terms>
</locale>
`;

const cslChicagoStyle = `<?xml version="1.0" encoding="utf-8"?>
<style xmlns="http://purl.org/net/xbiblio/csl" class="in-text" version="1.0" demote-non-dropping-particle="display-and-sort" page-range-format="chicago">
  <info>
    <title>Chicago Manual of Style 17th edition (author-date)</title>
    <id>http://www.zotero.org/styles/chicago-author-date</id>
    <link href="http://www.zotero.org/styles/chicago-author-date" rel="self"/>
    <link href="http://www.chicagomanualofstyle.org/tools_citationguide.html" rel="documentation"/>
    <author>
      <name>Julian Onions</name>
      <email>julian.onions@gmail.com</email>
    </author>
    <contributor>
      <name>Sebastian Karcher</name>
    </contributor>
    <contributor>
      <name>Richard Karnesky</name>
      <email>karnesky+zotero@gmail.com</email>
      <uri>http://arc.nucapt.northwestern.edu/Richard_Karnesky</uri>
    </contributor>
    <contributor>
      <name>Andrew Dunning</name>
      <email>andrew.dunning@utoronto.ca</email>
      <uri>https://orcid.org/0000-0003-0464-5036</uri>
    </contributor>
    <contributor>
      <name>Matthew Roth</name>
      <email>matthew.g.roth@yale.edu</email>
      <uri> https://orcid.org/0000-0001-7902-6331</uri>
    </contributor>
    <contributor>
      <name>Brenton M. Wiernik</name>
    </contributor>
    <category citation-format="author-date"/>
    <category field="generic-base"/>
    <summary>The author-date variant of the Chicago style</summary>
    <updated>2018-01-24T12:00:00+00:00</updated>
    <rights license="http://creativecommons.org/licenses/by-sa/3.0/">This work is licensed under a Creative Commons Attribution-ShareAlike 3.0 License</rights>
  </info>
  <locale xml:lang="en">
    <terms>
      <term name="editor" form="verb-short">ed.</term>
      <term name="container-author" form="verb">by</term>
      <term name="translator" form="verb-short">trans.</term>
      <term name="editortranslator" form="verb">edited and translated by</term>
      <term name="translator" form="short">trans.</term>
    </terms>
  </locale>
  <macro name="secondary-contributors">
    <choose>
      <if type="chapter entry-dictionary entry-encyclopedia paper-conference" match="none">
        <group delimiter=". ">
          <names variable="editor translator" delimiter=". ">
            <label form="verb" text-case="capitalize-first" suffix=" "/>
            <name and="text" delimiter=", "/>
          </names>
          <names variable="director" delimiter=". ">
            <label form="verb" text-case="capitalize-first" suffix=" "/>
            <name and="text" delimiter=", "/>
          </names>
        </group>
      </if>
    </choose>
  </macro>
  <macro name="container-contributors">
    <choose>
      <if type="chapter entry-dictionary entry-encyclopedia paper-conference" match="any">
        <group prefix=", " delimiter=", ">
          <names variable="container-author" delimiter=", ">
            <label form="verb" suffix=" "/>
            <name and="text" delimiter=", "/>
          </names>
          <names variable="editor translator" delimiter=", ">
            <label form="verb" suffix=" "/>
            <name and="text" delimiter=", "/>
          </names>
        </group>
      </if>
    </choose>
  </macro>
  <macro name="editor">
    <names variable="editor">
      <name name-as-sort-order="first" and="text" sort-separator=", " delimiter=", " delimiter-precedes-last="always"/>
      <label form="short" prefix=", "/>
    </names>
  </macro>
  <macro name="translator">
    <names variable="translator">
      <name name-as-sort-order="first" and="text" sort-separator=", " delimiter=", " delimiter-precedes-last="always"/>
      <label form="short" prefix=", "/>
    </names>
  </macro>
  <macro name="recipient">
    <choose>
      <if type="personal_communication">
        <choose>
          <if variable="genre">
            <text variable="genre" text-case="capitalize-first"/>
          </if>
          <else>
            <text term="letter" text-case="capitalize-first"/>
          </else>
        </choose>
      </if>
    </choose>
    <names variable="recipient" delimiter=", ">
      <label form="verb" prefix=" " text-case="lowercase" suffix=" "/>
      <name and="text" delimiter=", "/>
    </names>
  </macro>
  <macro name="substitute-title">
    <choose>
      <if type="article-magazine article-newspaper review review-book" match="any">
        <text macro="container-title"/>
      </if>
    </choose>
  </macro>
  <macro name="contributors">
    <group delimiter=". ">
      <names variable="author">
        <name and="text" name-as-sort-order="first" sort-separator=", " delimiter=", " delimiter-precedes-last="always"/>
        <label form="short" prefix=", "/>
        <substitute>
          <names variable="editor"/>
          <names variable="translator"/>
          <names variable="director"/>
          <text macro="substitute-title"/>
          <text macro="title"/>
        </substitute>
      </names>
      <text macro="recipient"/>
    </group>
  </macro>
  <macro name="contributors-short">
    <names variable="author">
      <name form="short" and="text" delimiter=", " initialize-with=". "/>
      <substitute>
        <names variable="editor"/>
        <names variable="translator"/>
        <names variable="director"/>
        <text macro="substitute-title"/>
        <text macro="title"/>
      </substitute>
    </names>
  </macro>
  <macro name="interviewer">
    <names variable="interviewer" delimiter=", ">
      <label form="verb" prefix=" " text-case="capitalize-first" suffix=" "/>
      <name and="text" delimiter=", "/>
    </names>
  </macro>
  <macro name="archive">
    <group delimiter=". ">
      <text variable="archive_location" text-case="capitalize-first"/>
      <text variable="archive"/>
      <text variable="archive-place"/>
    </group>
  </macro>
  <macro name="access">
    <group delimiter=". ">
      <choose>
        <if type="graphic report" match="any">
          <text macro="archive"/>
        </if>
        <else-if type="article-journal bill book chapter legal_case legislation motion_picture paper-conference" match="none">
          <text macro="archive"/>
        </else-if>
      </choose>
      <choose>
        <if type="webpage post-weblog" match="any">
          <date variable="issued" form="text"/>
        </if>
      </choose>
      <choose>
        <if variable="issued" match="none">
          <group delimiter=" ">
            <text term="accessed" text-case="capitalize-first"/>
            <date variable="accessed" form="text"/>
          </group>
        </if>
      </choose>
      <choose>
        <if type="legal_case" match="none">
          <choose>
            <if variable="DOI">
              <text variable="DOI" prefix="https://doi.org/"/>
            </if>
            <else>
              <text variable="URL"/>
            </else>
          </choose>
        </if>
      </choose>
    </group>
  </macro>
  <macro name="title">
    <choose>
      <if variable="title" match="none">
        <choose>
          <if type="personal_communication" match="none">
            <text variable="genre" text-case="capitalize-first"/>
          </if>
        </choose>
      </if>
      <else-if type="bill book graphic legislation motion_picture song" match="any">
        <text variable="title" text-case="title" font-style="italic"/>
        <group prefix=" (" suffix=")" delimiter=" ">
          <text term="version"/>
          <text variable="version"/>
        </group>
      </else-if>
      <else-if variable="reviewed-author">
        <choose>
          <if variable="reviewed-title">
            <group delimiter=". ">
              <text variable="title" text-case="title" quotes="true"/>
              <group delimiter=", ">
                <text variable="reviewed-title" text-case="title" font-style="italic" prefix="Review of "/>
                <names variable="reviewed-author">
                  <label form="verb-short" text-case="lowercase" suffix=" "/>
                  <name and="text" delimiter=", "/>
                </names>
              </group>
            </group>
          </if>
          <else>
            <group delimiter=", ">
              <text variable="title" text-case="title" font-style="italic" prefix="Review of "/>
              <names variable="reviewed-author">
                <label form="verb-short" text-case="lowercase" suffix=" "/>
                <name and="text" delimiter=", "/>
              </names>
            </group>
          </else>
        </choose>
      </else-if>
      <else-if type="legal_case interview patent" match="any">
        <text variable="title"/>
      </else-if>
      <else>
        <text variable="title" text-case="title" quotes="true"/>
      </else>
    </choose>
  </macro>
  <macro name="edition">
    <choose>
      <if type="bill book graphic legal_case legislation motion_picture report song" match="any">
        <choose>
          <if is-numeric="edition">
            <group delimiter=" " prefix=". ">
              <number variable="edition" form="ordinal"/>
              <text term="edition" form="short" strip-periods="true"/>
            </group>
          </if>
          <else>
            <text variable="edition" text-case="capitalize-first" prefix=". "/>
          </else>
        </choose>
      </if>
      <else-if type="chapter entry-dictionary entry-encyclopedia paper-conference" match="any">
        <choose>
          <if is-numeric="edition">
            <group delimiter=" " prefix=", ">
              <number variable="edition" form="ordinal"/>
              <text term="edition" form="short"/>
            </group>
          </if>
          <else>
            <text variable="edition" prefix=", "/>
          </else>
        </choose>
      </else-if>
    </choose>
  </macro>
  <macro name="locators">
    <choose>
      <if type="article-journal">
        <choose>
          <if variable="volume">
            <text variable="volume" prefix=" "/>
            <group prefix=" (" suffix=")">
              <choose>
                <if variable="issue">
                  <text variable="issue"/>
                </if>
                <else>
                  <date variable="issued">
                    <date-part name="month"/>
                  </date>
                </else>
              </choose>
            </group>
          </if>
          <else-if variable="issue">
            <group delimiter=" " prefix=", ">
              <text term="issue" form="short"/>
              <text variable="issue"/>
              <date variable="issued" prefix="(" suffix=")">
                <date-part name="month"/>
              </date>
            </group>
          </else-if>
          <else>
            <date variable="issued" prefix=", ">
              <date-part name="month"/>
            </date>
          </else>
        </choose>
      </if>
      <else-if type="legal_case">
        <text variable="volume" prefix=", "/>
        <text variable="container-title" prefix=" "/>
        <text variable="page" prefix=" "/>
      </else-if>
      <else-if type="bill book graphic legal_case legislation motion_picture report song" match="any">
        <group prefix=". " delimiter=". ">
          <group>
            <text term="volume" form="short" text-case="capitalize-first" suffix=" "/>
            <number variable="volume" form="numeric"/>
          </group>
          <group>
            <number variable="number-of-volumes" form="numeric"/>
            <text term="volume" form="short" prefix=" " plural="true"/>
          </group>
        </group>
      </else-if>
      <else-if type="chapter entry-dictionary entry-encyclopedia paper-conference" match="any">
        <choose>
          <if variable="page" match="none">
            <group prefix=". ">
              <text term="volume" form="short" text-case="capitalize-first" suffix=" "/>
              <number variable="volume" form="numeric"/>
            </group>
          </if>
        </choose>
      </else-if>
    </choose>
  </macro>
  <macro name="locators-chapter">
    <choose>
      <if type="chapter entry-dictionary entry-encyclopedia paper-conference" match="any">
        <choose>
          <if variable="page">
            <group prefix=", ">
              <text variable="volume" suffix=":"/>
              <text variable="page"/>
            </group>
          </if>
        </choose>
      </if>
    </choose>
  </macro>
  <macro name="locators-article">
    <choose>
      <if type="article-newspaper">
        <group prefix=", " delimiter=", ">
          <group delimiter=" ">
            <text variable="edition"/>
            <text term="edition"/>
          </group>
          <group>
            <text term="section" form="short" suffix=" "/>
            <text variable="section"/>
          </group>
        </group>
      </if>
      <else-if type="article-journal">
        <choose>
          <if variable="volume issue" match="any">
            <text variable="page" prefix=": "/>
          </if>
          <else>
            <text variable="page" prefix=", "/>
          </else>
        </choose>
      </else-if>
    </choose>
  </macro>
  <macro name="point-locators">
    <choose>
      <if variable="locator">
        <choose>
          <if locator="page" match="none">
            <choose>
              <if type="bill book graphic legal_case legislation motion_picture report song" match="any">
                <choose>
                  <if variable="volume">
                    <group>
                      <text term="volume" form="short" suffix=" "/>
                      <number variable="volume" form="numeric"/>
                      <label variable="locator" form="short" prefix=", " suffix=" "/>
                    </group>
                  </if>
                  <else>
                    <label variable="locator" form="short" suffix=" "/>
                  </else>
                </choose>
              </if>
              <else>
                <label variable="locator" form="short" suffix=" "/>
              </else>
            </choose>
          </if>
          <else-if type="bill book graphic legal_case legislation motion_picture report song" match="any">
            <number variable="volume" form="numeric" suffix=":"/>
          </else-if>
        </choose>
        <text variable="locator"/>
      </if>
    </choose>
  </macro>
  <macro name="container-prefix">
    <text term="in" text-case="capitalize-first"/>
  </macro>
  <macro name="container-title">
    <choose>
      <if type="chapter entry-dictionary entry-encyclopedia paper-conference" match="any">
        <text macro="container-prefix" suffix=" "/>
      </if>
    </choose>
    <choose>
      <if type="webpage">
        <text variable="container-title" text-case="title"/>
      </if>
      <else-if type="legal_case" match="none">
        <group delimiter=" ">
          <text variable="container-title" text-case="title" font-style="italic"/>
          <choose>
            <if type="post-weblog">
              <text value="(blog)"/>
            </if>
          </choose>
        </group>
      </else-if>
    </choose>
  </macro>
  <macro name="publisher">
    <group delimiter=": ">
      <text variable="publisher-place"/>
      <text variable="publisher"/>
    </group>
  </macro>
  <macro name="date">
    <choose>
      <if variable="issued">
        <group delimiter=" ">
          <date variable="original-date" form="text" date-parts="year" prefix="(" suffix=")"/>
          <date variable="issued">
            <date-part name="year"/>
          </date>
        </group>
      </if>
      <else-if variable="status">
        <text variable="status" text-case="capitalize-first"/>
      </else-if>
      <else>
        <text term="no date" form="short"/>
      </else>
    </choose>
  </macro>
  <macro name="date-in-text">
    <choose>
      <if variable="issued">
        <group delimiter=" ">
          <date variable="original-date" form="text" date-parts="year" prefix="[" suffix="]"/>
          <date variable="issued">
            <date-part name="year"/>
          </date>
        </group>
      </if>
      <else-if variable="status">
        <text variable="status"/>
      </else-if>
      <else>
        <text term="no date" form="short"/>
      </else>
    </choose>
  </macro>
  <macro name="day-month">
    <date variable="issued">
      <date-part name="month"/>
      <date-part name="day" prefix=" "/>
    </date>
  </macro>
  <macro name="collection-title">
    <choose>
      <if match="none" type="article-journal">
        <choose>
          <if match="none" is-numeric="collection-number">
            <group delimiter=", ">
              <text variable="collection-title" text-case="title"/>
              <text variable="collection-number"/>
            </group>
          </if>
          <else>
            <group delimiter=" ">
              <text variable="collection-title" text-case="title"/>
              <text variable="collection-number"/>
            </group>
          </else>
        </choose>
      </if>
    </choose>
  </macro>
  <macro name="collection-title-journal">
    <choose>
      <if type="article-journal">
        <group delimiter=" ">
          <text variable="collection-title"/>
          <text variable="collection-number"/>
        </group>
      </if>
    </choose>
  </macro>
  <macro name="event">
    <group delimiter=" ">
      <choose>
        <if variable="genre">
          <text term="presented at"/>
        </if>
        <else>
          <text term="presented at" text-case="capitalize-first"/>
        </else>
      </choose>
      <text variable="event"/>
    </group>
  </macro>
  <macro name="description">
    <choose>
      <if type="interview">
        <group delimiter=". ">
          <text macro="interviewer"/>
          <text variable="medium" text-case="capitalize-first"/>
        </group>
      </if>
      <else-if type="patent">
        <group delimiter=" " prefix=". ">
          <text variable="authority"/>
          <text variable="number"/>
        </group>
      </else-if>
      <else>
        <text variable="medium" text-case="capitalize-first" prefix=". "/>
      </else>
    </choose>
    <choose>
      <if variable="title" match="none"/>
      <else-if type="thesis personal_communication speech" match="any"/>
      <else>
        <group delimiter=" " prefix=". ">
          <text variable="genre" text-case="capitalize-first"/>
          <choose>
            <if type="report">
              <text variable="number"/>
            </if>
          </choose>
        </group>
      </else>
    </choose>
  </macro>
  <macro name="issue">
    <choose>
      <if type="legal_case">
        <text variable="authority" prefix=". "/>
      </if>
      <else-if type="speech">
        <group prefix=". " delimiter=", ">
          <group delimiter=" ">
            <text variable="genre" text-case="capitalize-first"/>
            <text macro="event"/>
          </group>
          <text variable="event-place"/>
          <text macro="day-month"/>
        </group>
      </else-if>
      <else-if type="article-newspaper article-magazine personal_communication" match="any">
        <date variable="issued" form="text" prefix=", "/>
      </else-if>
      <else-if type="patent">
        <group delimiter=", " prefix=", ">
          <group delimiter=" ">
            <!--Needs Localization-->
            <text value="filed"/>
            <date variable="submitted" form="text"/>
          </group>
          <group delimiter=" ">
            <choose>
              <if variable="issued submitted" match="all">
                <text term="and"/>
              </if>
            </choose>
            <!--Needs Localization-->
            <text value="issued"/>
            <date variable="issued" form="text"/>
          </group>
        </group>
      </else-if>
      <else-if type="article-journal" match="any"/>
      <else>
        <group prefix=". " delimiter=", ">
          <choose>
            <if type="thesis">
              <text variable="genre" text-case="capitalize-first"/>
            </if>
          </choose>
          <text macro="publisher"/>
        </group>
      </else>
    </choose>
  </macro>
  <citation et-al-min="4" et-al-use-first="1" disambiguate-add-year-suffix="true" disambiguate-add-names="true" disambiguate-add-givenname="true" givenname-disambiguation-rule="primary-name" collapse="year" after-collapse-delimiter="; ">
    <layout prefix="(" suffix=")" delimiter="; ">
      <group delimiter=", ">
        <choose>
          <if variable="issued accessed" match="any">
            <group delimiter=" ">
              <text macro="contributors-short"/>
              <text macro="date-in-text"/>
            </group>
          </if>
          <!---comma before forthcoming and n.d.-->
          <else>
            <group delimiter=", ">
              <text macro="contributors-short"/>
              <text macro="date-in-text"/>
            </group>
          </else>
        </choose>
        <text macro="point-locators"/>
      </group>
    </layout>
  </citation>
  <bibliography hanging-indent="true" et-al-min="11" et-al-use-first="7" subsequent-author-substitute="&#8212;&#8212;&#8212;" entry-spacing="0">
    <sort>
      <key macro="contributors"/>
      <key variable="issued"/>
      <key variable="title"/>
    </sort>
    <layout suffix=".">
      <group delimiter=". ">
        <text macro="contributors"/>
        <text macro="date"/>
        <text macro="title"/>
      </group>
      <text macro="description"/>
      <text macro="secondary-contributors" prefix=". "/>
      <text macro="container-title" prefix=". "/>
      <text macro="container-contributors"/>
      <text macro="edition"/>
      <text macro="locators-chapter"/>
      <text macro="collection-title-journal" prefix=", " suffix=", "/>
      <text macro="locators"/>
      <text macro="collection-title" prefix=". "/>
      <text macro="issue"/>
      <text macro="locators-article"/>
      <text macro="access" prefix=". "/>
    </layout>
  </bibliography>
</style>`;

export default class CitationService {
  private engine: CSL.Engine;
  private sys: CSLKernel = {
    retrieveItem: (id: string) => {
      return this.library.entries[id].toCSLJSON();
    },
    retrieveLocale: (language: string) => {
      return this.getLocale(language);
    },
  };

  library: Library;

  constructor() {
    this.engine = new CSL.Engine(this.sys, cslChicagoStyle);
  }

  get items(): CSLItem[] {
    return Object.values(this.library.entries);
  }

  getLocale(language: string): string {
    // TODO implement other locales
    return localeEnUS;
  }

  getCitation(id: string): string {
    if (!this.library) return;

    return this.engine.makeCitationCluster([{ id: id }]);
  }

  getBibliography(ids: string[]): [BibliographyOptions, string[]] {
    if (!this.library) return;

    this.engine.updateItems(ids);
    return this.engine.makeBibliography();
  }
}
