package agiw.crawling;

import java.io.IOException;
import java.nio.charset.Charset;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.util.HashSet;
import java.util.Set;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;


/** Estrae dal sito www.ordineavvocati.roma.it **/
public class Extractor {
	public static void main(String[] args) {
		Document doc;
		try{
			Files.delete(Paths.get("names.txt"));
		}
		catch(Exception e){
			System.out.println("file non trovato");
		}
		try {
			/*WEB*/
			doc = Jsoup.connect("http://www.ordineavvocati.roma.it/AlboElenchi/AlboAvvocati/AlboAvvocatiNew.asp")
					.maxBodySize(0)
					.userAgent("Mozilla/5.0 (Windows; U; WindowsNT 5.1; en-US; rv1.8.1.6) Gecko/20070725 Firefox/2.0.0.6")
					.data("cognome_ric", " ")
					.data("cap_ric", "")
					.data("localita_ric","ROMA")
					.data("submitf","yes")
					.post();
			/*FILE-LOCALE*/
			//doc = Jsoup.parse(new File("ordine_degli_avvocati_di_roma.html"), "UTF-8");
			Elements elements = doc.getElementsByAttribute("nowrap");
			System.out.println(elements.size());
			Set<String> lines = new HashSet<String>();
			for(Element e: elements)
				lines.add(parse(e)); 
			Files.write(Paths.get("names.txt"), lines, Charset.forName("UTF-8"), StandardOpenOption.CREATE);
		} 
		catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}

	public static String parse(Element e){
		String s = e.text().toLowerCase();
		if(s.startsWith("avv."))
			s=s.substring(5);
		s=s.replaceAll("\".*\"", "")
				.replaceAll("\\(.*\\)", "")
				.replaceAll("\\sdetto$", "")
				.replaceAll("a'", "à")
				.replaceAll("e'", "è")
				.replaceAll("i'", "ì")
				.replaceAll("o'", "ò")
				.replaceAll("u'", "ù");
		return s;
	}
}